const path = require('path')
const { fs } = require('@wa-dev/cli-shared-utils')

const appDirectory = fs.realpathSync(process.cwd())
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath)
const moduleFileExtensions = [
	'web.mjs',
	'mjs',
	'web.js',
	'js',
	'web.ts',
	'ts',
	'web.tsx',
	'tsx',
	'json',
	'web.jsx',
	'jsx',
]

const resolveModule = (resolveFn, filePath) => {
	const extension = moduleFileExtensions.find((extension) =>
		fs.existsSync(resolveFn(`${filePath}.${extension}`))
	)
	if (extension) {
		return resolveFn(`${filePath}.${extension}`)
	}
	return resolveFn(`${filePath}.js`)
}

module.exports = {
	appIndex: resolveModule(resolveApp, './src/main'),
	appBuild: resolveApp('dist'),
	appPublic: resolveApp('public'),
	appSrc: resolveApp('src'),
	appHtml: resolveApp('index.html'),
}
