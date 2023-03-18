exports.defaultPreset = {
	plugins: {
		// "@vue/cli-plugin-babel": {},
		// "@vue/cli-plugin-eslint": {
		//   config: "base",
		//   lintOn: ["save"],
		// },
	},
}
// TODO: 后续会增加一些业务上的预设
exports.defaults = {
	lastChecked: undefined,
	latestVersion: undefined,

	packageManager: undefined,
	useTaobaoRegistry: undefined,
	presets: {
		default: exports.defaultPreset,
	},
}
