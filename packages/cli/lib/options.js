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

// 共享cli-service 的包名，因为webpack，vite 是不同的cli-service
const SharedData = {
	SERVICE_PACKAGE_NAME: null,
}

/**
 *
 * @param {array} v cli service
 */
const setServicePackageName = (v) => {
	SharedData.SERVICE_PACKAGE_NAME = v
}

const getServicePackageName = (v) => SharedData.SERVICE_PACKAGE_NAME

exports.setServicePackageName = setServicePackageName
exports.getServicePackageName = getServicePackageName
