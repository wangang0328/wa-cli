const webpack = require('webpack')
const { merge } = require('webpack-merge')
const WebpackDevServer = require('webpack-dev-server')
const {
	fs,
	chalk,
	clearConsole,
	openBrowser,
} = require('@wa-dev/cli-shared-utils')
const prepareUrl = require('../utils/prepare-url')
const paths = require('../config/paths')
const baseConfig = require('../webpack.config')

const serverConfig = {
	host: '0.0.0.0',
	port: 3000,
	https: false,
	hot: true,
}

// 环境变量配置
process.env.BABEL_ENV = 'development'
process.env.NODE_ENV = 'development'

const setup = (userOptions) => {
	// 清空build文件
	fs.emptyDirSync(paths.appBuild)

	const webpackConfig = merge(baseConfig('development'), userOptions)

	// TODO: 拿配置文件的devServer， 没有使用默认的
	const protocol = serverConfig.https ? 'https' : 'http'
	const host = serverConfig.host
	const port = serverConfig.port
	const urls = prepareUrl(protocol, host, port)

	const compiler = webpack(webpackConfig)
	let devServer
	try {
		devServer = new WebpackDevServer(serverConfig, compiler)
	} catch (error) {
		console.log(error)
	}

	return new Promise((resolve, reject) => {
		let isFirstCompile = true
		// TODO: 代理配置
		compiler.hooks.beforeCompile.tap('wa-cli-service serve', () => {
			clearConsole()
			console.log(`\n\n${chalk.bgCyan('Waiting')} starting compile....\n`)
		})

		compiler.hooks.done.tap('wa-cli-service serve', (stats) => {
			if (stats.hasErrors()) {
				console.log(stats.errors)
				// return process.exit(1);
			}
			setTimeout(() => {
				if (isFirstCompile) {
					isFirstCompile = false
					// 打开浏览器
					openBrowser(urls.localUrlForBrowser)
					console.log(`${chalk.bgGreen('Done')} App started`)
				} else {
					console.log(`${chalk.bgGreen('Done')} App updated`)
				}
				console.log(`  App running at:`)
				console.log(`  - Local:   ${chalk.cyan(urls.localUrlForTerminal)}`)
				console.log(`  - Network: ${chalk.cyan(urls.lanUrlForTerminal)}`)
			}, 0)
		})
		resolve({
			server: devServer,
		})
		// devServer.startCallback((v) => {
		//   console.log("hello", v);
		// });
		// resolve();
		// compiler.run((err, stats) => {
		//   if (err) {
		//     return rejct(err);
		//   }
		//   console.log(stats.toJson({ all: false, warnings: true, errors: true }));
		//   resolve();
		// });
		devServer.start().catch((err) => reject(err))
	})
}

module.exports = setup
