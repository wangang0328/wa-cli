const { createSchema } = require("@wa-dev/cli-shared-utils");

exports.schema = createSchema((joi) =>
  joi.object({
    publicPath: joi.string().allow(""),
  })
);

exports.defaults = {};
