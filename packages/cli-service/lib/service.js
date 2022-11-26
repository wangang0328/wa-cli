const path = require("path");
const defaultsdeep = require("lodash.defaultsdeep");
const { error, chalk } = require("@wa/cli-shared-utils");
const { schema, defaults } = require("./options");

const loadOptions = (optionsPath, command) => {
  try {
    const userConfig = require(optionsPath);
    let config = {};
    if (typeof userConfig === "function") {
      return userConfig(command);
    }

    if (typeof config !== "object" || !config) {
      error(
        `load error ${chalk.bold("wa.config.js")}: expect function or object`
      );
      return {};
    }
  } catch (error) {
    return {};
  }
};

module.exports = class Service {
  constructor(context) {
    this.context = context;
  }

  run(command, args = {}, rawArgv = []) {
    // TODO: args rawArgv 后续加
    if (["start", "build", "test"].includes(command)) {
      const options = this.resolveUserOptions(defaults, command);
      const scriptPath = `./script/${command}`;
      require(scriptPath)(options)
        .then(() => {})
        .catch((err) => {
          console.log("命令执行错误：");
          console.log(err);
        });
    } else {
      error(`Unknow command ${command}`);
    }
  }

  /**
   * 获取用户配置
   */
  resolveUserOptions(defaultOptions, command) {
    const optionsPath = path.resolve(this.context, "wa.config.js");
    const userOptions = loadOptions(optionsPath, command);
    const targetOptions = defaultsdeep(defaultOptions, userOptions);
    const { error: validateError } = schema.validate(targetOptions);
    if (validateError) {
      const msg = validateError.details
        ? validateError.details.map((e) => `${e.message}\n`).join("")
        : "";
      error(`${chalk.bold("wa.config.js")} options is error: \n${msg}`);
    }

    return targetOptions;
  }
};
