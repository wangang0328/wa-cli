const commonjs = require("@rollup/plugin-commonjs");

module.exports = {
  input: "./index.js",
  output: {
    file: "build/index.js",
    format: "cjs",
  },
  plugins: [commonjs()],
};
