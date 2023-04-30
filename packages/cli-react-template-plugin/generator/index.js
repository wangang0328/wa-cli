module.exports = (api, options, rootOptions) => {
	// 根据模板框架选择对应的模板代码路径
	api.render('./template', {})

	api.extendPackage({
		dependencies: {
			react: '^18.2.0',
			'react-dom': '^18.2.0',
		},
		devDependencies: {
			'@types/react': '^18.0.25',
			'@types/react-dom': '^18.0.9',
			eslint: '^8.38.0',
			'eslint-plugin-react-hooks': '^4.6.0',
			'eslint-plugin-react-refresh': '^0.3.4',
			typescript: '^5.0.2',
		},
	})
	// TODO: 判断是否有ts， 有ts 删除jsconfig.json
	if (rootOptions.buildTool !== 'webpackAndVite') {
		// 没有使用vite构建工具，则删除掉默认vite的配置项
		api.render((files) => delete files['vite.config.ts'])
	}
}
