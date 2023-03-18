exports.getFeaturePromptModules = () =>
	['typescript'].map((fileName) => require(`./${fileName}`))
