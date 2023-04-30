const getTemplateInfoByType = (template) => {
	const TemplateInfo = {
		react: {
			source: './template-react',
			dependencies: {
				react: '^18.2.0',
				'react-dom': '^18.2.0',
			},
			devDependencies: {
				'@types/react': '^18.0.25',
				'@types/react-dom': '^18.0.9',
			},
		},
		vue: {
			source: './template-vue',
			dependencies: {},
			devDependencies: {},
		},
	}
	return TemplateInfo[template]
}

module.exports = (api, options, rootOptions) => {
	const { template } = rootOptions
	// 根据模板框架选择对应的模板代码路径和依赖包信息
	const templateInfo = getTemplateInfoByType(rootOptions.template)
	if (!templateInfo) {
		console.error(`Can not process template: ${template}.`)
		process.exit(1)
	}

	api.render(templateInfo.source, {})

	api.extendPackage({
		dependencies: templateInfo.dependencies || {},
		devDependencies: templateInfo.devDependencies || {},
		peerDependencies: templateInfo.peerDependencies || {},
	})

	// 根据所选构建工具生成打包命令
	api.extendPackage({
		scripts: {},
	})

	// TODO: 根据前端框架和构建工具生成一些特殊的包，拆出去把

	// TODO: 判断是否有ts， 有ts 删除jsconfig.json
}
