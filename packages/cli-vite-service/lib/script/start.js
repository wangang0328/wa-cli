// const { fileURLToPath } = require('url')
const { createServer, defineConfig } = require('vite')
const defaultsdeep = require('lodash.defaultsdeep')
// const { fs } = require('@wa-dev/cli-shared-utils')
const paths = require('../config/paths')

// 环境变量配置
process.env.NODE_ENV = 'development'

// const __dirname = fileURLToPath(new URL('.', import.meta.url))

const devOptions = defineConfig({
	// 任何合法的用户配置选项，加上 `mode` 和 `configFile`
	configFile: false,
	// root: __dirname,
	server: {
		port: 3000,
		open: true,
	},
	resolve: {
		'@': paths.appSrc
	}
})

const setup = async (options) => {
	// 清空build文件
	// fs.emptyDirSync(paths.appBuild)
	const server = await createServer(defaultsdeep(devOptions, options))
	await server.listen()

	server.printUrls()
}

module.exports = setup
