module.exports = (api, options, rootOptions) => {
	if (rootOptions.buildTool === 'webpackAndVite') {
		api.extendPackage({
			scripts: {
				build: 'wa-cli-webpack-service build',
				'start:webpack': ''
			},
		})
	} else {
		api.extendPackage({
			scripts: {
				start: 'wa-cli-webpack-service start',
				build: 'wa-cli-webpack-service build',
			},
		})
	}
	api.extendPackage({
		browserslist: ['> 1%', 'last 2 versions', 'not dead'],
	})
}
