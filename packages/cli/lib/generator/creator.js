const EventEmitter = require('events')
const os = require('os')
const cloneDeep = require('lodash.clonedeep')
const inquirer = require('inquirer')
const { defaultPreset } = require('../options')
const PackageManager = require('./packageManager')
const Generator = require('./Generator')
const writeFileTree = require('../utils/writeFileTree')
const sortObject = require('../utils/sortObject')
const PromptModuleAPI = require('../PromptModuleAPI')

const {
	clearConsole,
	hasGit,
	hasProjectGit,
	execa,
	log,
	loadModule,
	chalk,
} = require('@wa-dev/cli-shared-utils')
const getVersions = require('../utils/get-versions')
const path = require('path')

module.exports = class Creator extends EventEmitter {
	constructor(projectName, context, promptModules) {
		super()
		console.log('projectName----------', projectName)
		this.projectName = projectName
		this.context = context
		const featurePrompt = this.resolveFeaturePrompt()
		this.presetPrompts = []
		this.featurePrompt = featurePrompt
		// 选择某个特性后，可能会有额外的提示选项
		this.injectedPrompts = []
		// 当选中所有的选项后，执行的回调数组
		this.promptCompleteCbs = []

		const promptAPI = new PromptModuleAPI(this)
		// 有preset feature 的prompt
		promptModules.forEach((cb) => cb(promptAPI))
	}

	resolveFinalPrompts() {
		const finalPrompts = [
			...this.presetPrompts,
			this.featurePrompt,
			...this.injectedPrompts,
		]
		return finalPrompts
	}

	async promptAndResolvePreset() {
		const answers = await inquirer.prompt(this.resolveFinalPrompts())
		console.log('answers:', answers)
		const preset = cloneDeep(defaultPreset)
		answers.features = answers.features || []
		this.promptCompleteCbs.forEach((cb) => cb(answers, preset))
		return preset
	}

	async create(cliOptions) {
		const preset = cloneDeep(await this.promptAndResolvePreset())
		console.log(preset)
		// 生成package.json
		// 插入核心
		const { context, name } = this
		preset.plugins['@wa-dev/cli-service'] = Object.assign(
			{
				projectName: name,
			},
			preset
		)
		const latestMinor = await getVersions()
		const pkg = {
			name,
			version: '0.0.1',
			private: true,
			devDependencies: {},
			dependencies: {},
		}
		// 设置包名、依赖, 将preset的依赖赋值给pkg，后续将pkg写入到package.json 文件
		// 抽离出@wa 开头的依赖，添加版本号，同时为后续解析插件做准备
		Object.entries(preset.plugins).forEach(([depName, { version }]) => {
			pkg.devDependencies[depName] =
				version || (/^@wa-dev/.test(depName) ? `${latestMinor}` : 'latest')
		})
		const pm = new PackageManager(context, { pkg })
		// 写入 package.json
		await writeFileTree(context, {
			// os.EOL 是一个常量，放回当前操作系统的换行符 （Windows系统是\r\n，其他系统是\n）
			'package.json': JSON.stringify(pkg, null, 2) + os.EOL,
		})

		// 校验是否git初始化
		const shouldInitGit = this.shouldInitGit(cliOptions)
		if (shouldInitGit) {
			// TODO: 动画
			// console.log("git K开始");
			await this.run('git init')
			// console.log("git 结束---");
		}
		// clearConsole()
		log(`⚙\u{fe0f}  Installing CLI plugins. This might take a while...`)
		log()
		// this.emit('creation', { event: 'plugins-install' })

		// 执行 npm install
		if (process.env.WA_DEBUG) {
			// 开发环境不远程拉取 cli-service
			console.log(
				`${chalk.blueBright('[wa-cli]: ')}${chalk.yellowBright(
					'开启本地调试模式!\n'
				)}`
			)
			await require('../utils/setupDevProject')(context)
		} else {
			await pm.install()
		}

		// 开始构造项目
		log(`🚀  Invoking generators...`)
		const plugins = await this.resolvePlugins(preset.plugins)
		console.log('resolved plugins:', plugins)
		const generator = new Generator(this.context, {
			name: this.projectName, // 项目名称
			pkg, // package.json 包
			plugins, // 插件
			pm, // PackageManager 包管理器实例
		})
		// 生成代码
		generator.generate()

		if (!process.env.WA_DEBUG) {
			// 会重新执行安装，因为生成器可能会插入新的依赖
			await pm.install()
		}
		// clearConsole()
		return

		generator.generate()
		if (!process.env.WA_DEBUG) {
			await pm.install()
		}
		clearConsole()
		// TODO: 根据命令来
		log(`🎉  Successfully created project ${chalk.yellow(this.projectName)}.\n`)
		log(`👉  Get started with the following commands:\n\n`)
		log(chalk.cyan(` ${chalk.gray('$')} cd ${this.projectName}\n`))
		log(chalk.cyan(` ${chalk.gray('$')} npm run start\n`))
	}

	resolveFeaturePrompt() {
		const featurePrompt = {
			name: 'features',
			type: 'checkbox',
			message: 'Check the features needed for your project',
			choices: [],
		}
		return featurePrompt
	}

	shouldInitGit(cliOptions) {
		if (!hasGit()) {
			return false
		}

		// --no-git
		if ('noGit' in cliOptions) {
			return false
		}

		// --git
		if (cliOptions.forceGit) {
			return true
		}

		// default: true unless already in a git repro
		return !hasProjectGit(this.context)
	}

	run(commandPar, argsPar = []) {
		const [command, ...args] = [...commandPar.split(/\s+/), ...argsPar]
		return execa(command, args, { cwd: this.context })
	}

	// 解析插件
	// { id: options } => [{ id, apply, options }]
	async resolvePlugins(rowPlugins) {
		// ensure cli-service is invoked first and sort
		// 确保@wa-dev/cli-service 插件是被正确添加进去的
		rowPlugins = sortObject(rowPlugins, ['@wa-dev/cli-service'], true)

		// 缓存插件
		const plugins = []
		// 遍历插件列表
		Object.entries(rowPlugins).forEach(([id, value]) => {
			let targetId = id
			if (process.env.WA_DEBUG) {
				targetId = targetId.replace(/^@wa-dev\//, '')
			}
			// 相当于 require(`${id}/generator`) 每个子项目下面会有一个generator文件夹
			// generator/index.js 作为插件的入口， 所以加载入口模块
			// loadModule使用pnpm 报错找不到模块
			// 为什么使用loadModule，因为要从安装cli的地方，去找到项目的plugin
			const apply = loadModule(`${id}/generator`, this.context) || (() => {})
			// const apply = require(`${id}/lib/generator`) || (() => {})

			// id: 插件的id，apply 执行程序，配置项options
			plugins.push({ id, apply, options: value || {} })
		})
		return plugins
	}
}
