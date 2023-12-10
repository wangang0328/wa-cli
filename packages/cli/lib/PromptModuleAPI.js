class PromptModuleAPI {
	constructor(creator) {
		this.creator = creator
	}

	injectPresetsPrompt(presetPrompt) {
		this.creator.presetPrompts.push(presetPrompt)
	}

	/**
	 * 插入特性
	 */
	injectFeature (feature) {
		this.creator.featurePrompt.choices.push(feature)
	}

	injectPrompt(prompt) {
		this.creator.injectedPrompts.push(prompt)
	}

	injectOptionForPrompt(promptName, option) {
		const v = this.creator.injectedPrompts.find(
			({ name }) => promptName === name
		)
		if (v) {
			v.choices.push(option)
		}
	}

	onPromptComplete (cb) {
		// 完成弹窗后的回调
		this.creator.promptCompleteCbs.push(cb)
	}
}

module.exports = PromptModuleAPI
