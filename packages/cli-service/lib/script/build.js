const webpack = require("webpack");
const { merge } = require("webpack-merge");
const {
  fs,
  chalk,
  stopSpinner,
  logWithSpinner,
  clearConsole,
} = require("@wa-dev/cli-shared-utils");
const paths = require("../config/paths");
const baseConfig = require("../webpack.config");

// 环境变量配置
process.env.BABEL_ENV = "production";
process.env.NODE_ENV = "production";

const copyPublicFolder = () => {
  fs.copySync(paths.appPublic, paths.appBuild, {
    dereference: true,
    filter: (file) => file !== paths.appHtml,
  });
};

const build = (userOptions = {}) => {
  fs.emptyDirSync(paths.appBuild);
  copyPublicFolder();
  const webpackConfig = merge(baseConfig("production"), userOptions);
  console.log(`\n\n${logWithSpinner("starting build....") || ""}\n`);
  return new Promise((resolve, reject) => {
    const compiler = webpack(webpackConfig);
    compiler.run((err, stats) => {
      if (err) {
        return reject(err);
      }
      if (stats.hasErrors()) {
        return reject(new Error("Build failed weith errors."));
      }
      clearConsole();
      console.log(`${chalk.bgGreen("Done")} Build success.`);
      stopSpinner(false);
      resolve();
    });
  });
};

module.exports = build;
