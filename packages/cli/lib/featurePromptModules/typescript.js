module.exports = (cli) => {
	cli.injectFeature({
		name: 'TypeScript',
		value: 'ts',
		short: 'TS',
		description: 'Add support for the TypeScript language',
		link: 'https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-typescript',
		plugins: ['typescript'],
	})
	cli.onPromptComplete((answers, options) => {
		console.log(answers, options)
	})
}
