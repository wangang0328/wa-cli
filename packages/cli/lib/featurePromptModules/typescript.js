module.exports = (cli) => {
	cli.injectFeature({
		name: 'TypeScript',
		value: 'ts',
		short: 'TS',
		description: 'Add support for the TypeScript language',
		link: '',
		plugins: ['typescript'],
	})

	cli.onPromptComplete((answers, options) => {
		// if (answers.features.includes('ts')) {
		// 	options.plugins['@vue/cli-plugin-typescript'] = {}
		// }
		// console.log(answers, options)
	})
}
