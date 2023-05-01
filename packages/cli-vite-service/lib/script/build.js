// const { fileURLToPath } = require('url')
const { build } = require('vite')
const defaultsdeep = require('lodash.defaultsdeep')
// const { fs } = require('@wa-dev/cli-shared-utils')
const paths = require('../config/paths')

// 环境变量配置
process.env.NODE_ENV = 'production'

// const __dirname = fileURLToPath(new URL('.', import.meta.url))
const buildOptions = {
	root: paths.build,
}

const setup = async (options) => {
	// 清空build文件
	// fs.emptyDirSync(paths.appBuild)
	await build(defaultsdeep(buildOptions, options))
}

module.exports = setup
