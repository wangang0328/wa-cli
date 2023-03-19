/**
 * 用来抛出一些原构造器的方法， 提供外部的plugins使用，任其apply调用此实例
 */
const { getShortPluginId } = require('@wa-dev/cli-shared-utils')
const { isBinaryFileSync } = require('isbinaryfile')
const path = require('path')
const fs = require('fs')
const deepmerge = require('deepmerge')
const mergeDeps = require('../utils/merge-deps')

const isString = (val) => typeof val === 'string'
const isFunction = (val) => typeof val === 'function'
const isObject = (val) => val && typeof val === 'object'
const isArray = (val) => Array.isArray(val)
const mergeArrayWithDedupe = (a, b) => Array.from(new Set([...a, ...b]))

// 判断是否是纯粹的对象，也就是通过 {} new Object() Object.create(null) 创建的对象
const isPlainObject = (obj) => {
	if (!isObject(obj)) return false
	let proto = obj
	// 比如[]的原型链 []=>Array.protoype=>Object.getPrototype => null
	// {} => Object.prototype => null
	while (Object.getPrototypeOf(proto) !== null) {
		proto = Object.getPrototypeOf(proto)
	}
	return Object.getPrototypeOf(obj) === proto
}

module.exports = class GeneratorApi {
	/**
	 * @param {string} id 插件名
	 * @param {Generator} generator 构造器实例
	 * @param {object} options 插件配置选项
	 * @param {object} rootOptions 预设配置选项
	 */
	constructor(id, generator, options, rootOptions) {
		this.id = id
		this.generator = generator
		this.options = options
		this.rootOptions = rootOptions

		this.pluginsData = generator.plugins
			.filter(({ id }) => id !== `@vue/cli-service`)
			.map(({ id }) => ({
				name: getShortPluginId(id),
			}))
	}

	/**
	 * 扩展package
	 * @param {Object|Function} fields
	 * @param {Object|Boolean} options
	 */
	extendPackage(fields, options = {}) {
		const extendOptions = {
			merge: true,
			warnIncomplatiableVersions: true,
			forceOverwrite: true,
			...options,
		}
		// pkg信息重generator中获取
		const pkg = this.generator.pkg
		const toMerge = isFunction(fields) ? fields(pkg) : fields

		// 扩展package.json 内容
		for (const key in toMerge) {
			const value = toMerge[key]
			// 是否存在pkg包
			const existing = pkg[key]
			// 判断对象是否是一般对象，并且是依赖dep对象
			if (
				isPlainObject(value) &&
				(key === 'dependencies' || key === 'devDependencies')
			) {
				// 如果是dependencies 对象 直接合并
				pkg[key] = mergeDeps(
					this.id,
					existing || {},
					value,
					this.generator.depSources,
					extendOptions
				)
			} else if (!extendOptions.merge || !(key in pkg)) {
				// 不合并的情景
				pkg[key] = value
			} else if (isArray(value) && isArray(existing)) {
				// 合并数组
				pkg[key] = mergeArrayWithDedupe(existing, value)
			} else if (isObject(value) && isObject(existing)) {
				pkg[key] = deepmerge(existing, value, {
					arrayMerge: mergeArrayWithDedupe,
				})
			} else {
				pkg[key] = value
			}
		}
	}

	/**
	 * 渲染模板
	 * @param {string} source 模板文件的相对路径
	 * @param {object} additionalData 添加模板的额外数据
	 * @param {object} ejsOptions ejs 模板配置
	 */
	async render(source, additionalData = {}, ejsOptions = {}) {
		const baseDir = extractCallDir()
		if (isString(baseDir)) {
			this._injectFileMiddleware(async (files) => {
				source = path.resolve(baseDir, source)
				const globby = require('globby')
				// dot: true 匹配以点开头的文件
				const _files = await globby(['**/*'], { cwd: source, dot: true })
				for (const rawPath of _files) {
					const sourcePath = path.resolve(source, rawPath)
					const content = renderFile(sourcePath)
					files[rawPath] = content
				}
			})
		} else {
			if (process.env.WA_DEBUG) {
				console.log('暂时不支持source的参数类型', source)
			}
		}
	}

	_injectFileMiddleware(middleware) {
		this.generator.fileMiddlewares.push(middleware)
	}

	_resolveData(additionalData) {
		return Object.assign(
			{
				options: this.options,
				rootOptions: this.rootOptions,
				plugins: this.pluginsData,
			},
			additionalData
		)
	}

	/**
	 * 设置基础信息
	 */
	setBaseInfo(fields) {
		const baseInfo = this.generator.baseInfo
		const toMerge = isFunction(fields) ? fields(pkg) : fields
		// TODO: 完善merge
		Object.assign(baseInfo, toMerge)
	}
}

/**
 * 获取执行api.render()方法的文件路径
 */
function extractCallDir() {
	const obj = {}
	Error.captureStackTrace(obj)
	// ['Error','    at extractCallDir (E:\\interview\\wa-cli\\packages\\test\\test.js:3:8)', ...]
	// 为什么是3？ 0-> Error,  1 -> extractCallDir(generatorAPI) 2->  GeneratorApi.render， 3-> 就是了
	const callSite = obj.stack.split('\n')[3]
	// 获取文件路径
	const namedStackReg = /\s\((.*):\d+:\d+\)$/
	// 当在anonymous 调用的情况
	const anonymousStackRge = /at (.*):\d+\d+$/

	let matchResult = callSite.match(namedStackReg)
	if (!matchResult) {
		matchResult = callSite.match(anonymousStackRge)
	}
	const fileName = matchResult[1]
	return path.dirname(fileName)
}

/**
 * 后面可以通过该函数执行ejs
 * @param {*} name
 */
function renderFile(name) {
	if (isBinaryFileSync(name)) {
		return fs.readFileSync(name)
	}
	return fs.readFileSync(name, 'utf-8')
}
