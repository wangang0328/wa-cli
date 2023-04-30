const { isBinaryFileSync } = require('isbinaryfile')
const os = require('os')
const path = require('path')
const merge = require('lodash.merge')
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
		const cliServiceOptions = plugins
			.filter(({ id }) =>
				['@wa-dev/cli-webpack-service', '@wa-dev/cli-vite-service'].includes(id)
			)
			.reduce((accOptions, current) => {
				return merge(accOptions, current.options)
			}, {})

		// 预设配置
		this.rootOptions = cliServiceOptions
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
		// 初始化构造器的时候，初始化插件
		this.initPlugins()

		await this.resolveFiles()
		// 保存package.json 文件
		this.files['package.json'] = JSON.stringify(this.pkg, null, 2) + os.EOL
		await writeFileTree(this.context, this.files)
	}
}
