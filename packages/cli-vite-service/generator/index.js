const packageJSON = require('../package.json')
const viteVersion = packageJSON.dependencies.vite

module.exports = (api, options, rootOptions) => {
	api.extendPackage({
		scripts: {
			start: 'wa-cli-vite-service start',
		},
		devDependencies: {
			vite: viteVersion,
		},
	})
}
