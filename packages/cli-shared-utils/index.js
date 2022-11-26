[
  "logger",
  "env",
  "module",
  "validator",
  "open-browser",
  "css-module-local-ident",
  "spinner",
].forEach((m) => {
  Object.assign(exports, require(`./lib/${m}`));
});

exports.chalk = require("chalk");
exports.execa = require("execa");
exports.semver = require("semver");
exports.fs = require("fs-extra");
