const { isBinaryFileSync } = require('isbinaryfile')
const os = require('os')
const path = require('path')
const globby = require('globby') // 查找加载文件
const GeneratorAPI = require('./generatorAPI')
const writeFileTree = require('../utils/writeFileTree')
const { isPlugin, fs } = require('@wa-dev/cli-shared-utils')
// const templatePath = "../../../cli-service/generator/template";

const renderFile = (name) => {
	// 如果是二进制文件（eg：favicon.ico）
	if (isBinaryFileSync(name)) {
		return fs.readFileSync(name) // 二进制流
	}
	return fs.readFileSync(name, 'utf-8')
}

module.exports = class Generator {
	constructor(context, { pkg, plugins, pm }) {
		this.context = context
		this.pkg = pkg
		this.plugins = plugins
		this.pm = pm
		this.depSources = {}
		// 存储一些基本信息
		this.baseInfo = {}
		// 生成器先把所有要生成的文件和文件内容放在files对象里
		this.files = {}
		// 生成文件的中间件，每个插件都会向中间件里插入中间件，中间件会负责向this.files里写文件
		this.fileMiddlewares = []
		const cliService = plugins.find(({ id }) => id === '@wa-dev/cli-service')
		// 预设配置
		this.rootOptions = cliService.options

		this.allPluginIds = [
			Object.keys(pkg.devDependencies),
			...Object.keys(pkg.dependencies),
		].filter(isPlugin)
	}

	// 解析plugins
	async initPlugins() {
		const { rootOptions } = this
		for (const plugin of this.plugins) {
			const { id, apply, options } = plugin
			const api = new GeneratorAPI(id, this, options, rootOptions)
			await apply(api, options, rootOptions)
		}
	}

	async resolveFiles() {
		const { files } = this
		for (const middleware of this.fileMiddlewares) {
			await middleware(files)
		}
	}
	async generate() {
		console.log('开始生成文件')
		// 初始化构造器的时候，初始化插件
		this.initPlugins()

		await this.resolveFiles()
		// 保存package.json 文件
		this.files['package.json'] = JSON.stringify(this.pkg, null, 2) + os.EOL
		await writeFileTree(this.context, this.files)
		return
		// const baseDir = path.resolve(
		//   __dirname,
		//   "../../node_modules/@wa-dev/cli-service/lib/generator/template"
		// );
		const baseDir = this.baseInfo.template?.basePath
		// dot: true 匹配以点开头的文件
		const _files = await globby(['**'], { cwd: baseDir, dot: true })
		const filesContentTree = _files.reduce((content, sorucePath) => {
			content[sorucePath] = renderFile(path.resolve(baseDir, sorucePath))
			return content
		}, {})
		// 保存package.json 文件
		filesContentTree['package.json'] =
			JSON.stringify(this.pkg, null, 2) + os.EOL
		await writeFileTree(this.context, filesContentTree)
	}
}
