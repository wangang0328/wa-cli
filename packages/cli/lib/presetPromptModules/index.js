exports.getPresetPromptModules = () =>
	['template', 'buildTool'].map((fileName) => require(`./${fileName}`))
