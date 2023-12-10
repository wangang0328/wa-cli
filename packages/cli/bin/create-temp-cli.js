#! /usr/bin/env node

const slash = require('slash') // 统一处理路径 斜杠和反斜杠
const path = require('path')
const fs = require('fs-extra')

// TODO: 校验node版本
// console.log(slash(process.cwd()))
if (
	slash(process.cwd()).indexOf('/packages/test') > 0 &&
	(fs.existsSync(path.resolve(process.cwd()), './@wa-dev') ||
		fs.existsSync(path.resolve(process.cwd(), '../@wa-dev')))
) {
	// 判断当前是否开发测试
	process.env.WA_DEBUG = true
}

const { Command } = require('commander')
const minimist = require('minimist') // 命令行解析参数
const packageJson = require('../package')

const program = new Command()

// console.log(process.argv)

// wa --version 时 显示
program
	.version(`@wa-dev/cli ${packageJson.version}`)
	.usage('<command> [options]') // usage 修改帮助信息的首行提示

program
	.command('create <app-name>')
	.description('create a new project')
	.option(
		'-p, --preset <presetName>',
		'Skip prompts and use saved or remove preset'
	)
	.option('-d, --default', 'Skip prompts and use default preset')
	.option('-l, --local', 'Module context require local url')
	.option(
		'-g, --git [message]',
		'Force git initialization with initial commit message'
		// true // 默认值
	)
	.option('-n, --no-git', 'Skip git initialization')
	.option('--merge', 'Merge target directory if it exists')
	.action((name, options) => {
		// process.argv 是个数组，第一个是node的程序所在位置，第二个是所执行的文件
		// name 是create的 参数
		// _ 放的是没有关联选项参数的
		if (!minimist(process.argv.slice(3))._.length) {
			console.log(
				'@wa-dev/cli need a project name, place input your project name, check it by wa --help.'
			)
			process.exit(1)
		}

		if (process.argv.includes('-g') || process.argv.includes('--git')) {
			options.forceGit = true
		}
		require('../lib/create')(name, options)
	})

// TODO: 做一些命令
program
	.command('add', 'add module to exist project')
	.command('delete', 'delete a module from project')
	.command('list', 'list all the modules')
// 解析命令行参数
program.parse(process.argv)
