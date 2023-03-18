const fs = require('fs-extra')
const path = require('path')
const fileNames = fs.readdirSync(path.resolve(__dirname, './lib'))

fileNames.forEach((fileName) => {
	Object.assign(exports, require(`./lib/${fileName}`))
})

exports.chalk = require('chalk')
exports.execa = require('execa')
exports.semver = require('semver')
exports.fs = require('fs-extra')
