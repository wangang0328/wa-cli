/**
 * 提示模块 往creator 插入feature、prompt
 * @param {PromptModuleAPI} cli
 */
module.exports = (cli) => {
	cli.injectPresetsPrompt({
		name: 'buildTool',
		message: 'Please Choose a build tool to build your project.',
		type: 'list',
		choices: [
			{
				name: 'Use webpack in production, use vite in development',
				value: 'webpackAndVite',
			},
			{
				name: 'Webpack',
				value: 'webpack',
			},
			{
				name: 'Vite',
				value: 'vite',
			},
		],
	})

	cli.onPromptComplete((answers, preset) => {
		preset.buildTool = answers.buildTool
	})
}
