module.exports = (cli) => {
	cli.injectPresetsPrompt({
		name: 'template',
		type: 'list',
		message: 'Please choose your use template',
		choices: [
			{
				name: 'React',
				value: 'react',
			},
			{
				name: 'Vue',
				value: 'vue',
			},
		],
	})

	cli.onPromptComplete((answers, options) => {
		options.template = answers.template
	})
}
