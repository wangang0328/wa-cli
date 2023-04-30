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
		},
	})
	// TODO: 判断是否有ts， 有ts 删除jsconfig.json
}
