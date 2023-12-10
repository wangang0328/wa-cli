const { createSchema } = require("@wa-dev/cli-shared-utils");

exports.schema = createSchema((joi) =>
	joi.object({
		publicPath: joi.string().allow(''),
		devServer: joi.object(),
		plugins: joi.array(),
    resolve: joi.object({
      extensions: joi.array(),
      alias: joi.object()
    }),
		// module 比较麻烦，后面再考虑把
		// module: joi.
	})
)

exports.defaults = {};
