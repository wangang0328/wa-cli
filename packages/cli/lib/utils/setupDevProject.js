const path = require('path')
const fs = require('fs-extra')
const cmdShim = require('cmd-shim') // 创建不同终端可执行脚本

// 只是在开发环境中使用
const linkBin = async (src, dest) => {
	if (!process.env.WA_DEBUG) {
		throw new Error('linkBin should only be used during tests or debugging.')
	}

	if (process.platform === 'win32') {
		// 执行之后会在 to 参数指定的目录中出现两个可执行脚本，command-name.cmd 和 command-name
		await cmdShim(src, dest)
	} else {
		await fs.ensureDir(path.dirname(src))
		await fs.symlink(src, dest)
		// 读（r=4），写（w=2），执行（x=1） 综可读可执行（rx=5=4+1）、可读可写（rw=6=4+2）、可读可写可执行(rwx=7=4+2+1)
		await fs.chmod(dest, '755') // 用于更改给定路径的权限
	}
}
const setupDevProject = (targetDir, cliServiceName) => {
	// 在node_modules/.bin 生成wa-cli-service 和wa-cli-service.cmd
	// require.resolve("@wa-dev/cli-service/bin/wa-cli-service") 有软链
	return linkBin(
		require.resolve(`@wa-dev/${cliServiceName}/bin/cli-service`),
		path.join(targetDir, 'node_modules', '.bin', `wa-${cliServiceName}`)
	)
}

module.exports = setupDevProject
