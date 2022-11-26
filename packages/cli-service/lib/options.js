const { createSchema } = require("@wa/cli-shared-utils");

exports.schema = createSchema((joi) =>
  joi.object({
    publicPath: joi.string().allow(""),
  })
);

exports.defaults = {};
