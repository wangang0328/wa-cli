const path = require('path')
const validateProjectName = require('validate-npm-package-name')
const fs = require('fs-extra')
const inquirer = require('inquirer')
const { error, chalk } = require('@wa-dev/cli-shared-utils')

const { getPresetPromptModules } = require('./presetPromptModules')
const { getFeaturePromptModules } = require('./featurePromptModules')
const Creator = require('./generator/Creator')

const create = async (projectName, options) => {
	// 1. 校验项目名字
	// 执行程序的路径
	const cwd = options.cwd || process.cwd()
	const appDir = path.resolve(cwd, projectName || '.')

	const validatedResult = validateProjectName(projectName)

	if (!validatedResult.validForNewPackages) {
		// 包名不合法
		error(
			`Invalid project name: "${chalk.green(projectName)}", fllow this resons:`,
			'tag'
		)
		let i = 0
		validatedResult.errors &&
			validatedResult.errors.forEach((err) => {
				console.error(`${++i}. ${err}`)
			})
		validatedResult.warnings &&
			validatedResult.warnings.forEach((err) => {
				console.error(`${++i}. ${err}`)
			})
		process.exit(1)
	}

	if (fs.existsSync(appDir) && !options.merge) {
		// 包名是否存在
		const { ok } = await inquirer.prompt([
			{
				name: 'ok',
				type: 'confirm',
				message: `Target directory ${appDir} already exists. we will remove this directory, are you sure?`,
			},
		])
		if (!ok) {
			return
		}
		console.log(`\nRemove ${appDir}...`)
		fs.removeSync(appDir)
	}

	const presetPromptModules = getPresetPromptModules()
	const featurePromptModules = getFeaturePromptModules()
	// 创建creator
	const creator = new Creator(projectName, appDir, [
		...presetPromptModules,
		...featurePromptModules,
	])
	await creator.create(options)
}

/**
 * 对项目名的校验，参数的处理，调用Creator类
 * @param {string} projectName
 * @param {Record<string, any>} options
 * @returns
 */
module.exports = function (projectName, options) {
	create(projectName, options).catch((err) => {
		console.error(err)
		if (process.env.WA_DEBUG) {
			process.exit(1)
		}
	})
}
