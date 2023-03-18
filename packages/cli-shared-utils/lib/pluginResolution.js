const PluginReg = /^@wa-dev\/cli-plugin-/

exports.isPlugin = (id) => PluginReg.test(id)
