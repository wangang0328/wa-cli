const path = require("path");
const validateProjectName = require("validate-npm-package-name");
const fs = require("fs-extra");
const inquirer = require("inquirer");
const { error, chalk } = require("@wa/cli-shared-utils");

const Creator = require("./generator/creator");

const create = async (projectName, options) => {
  // 1. 校验项目名字
  console.log("do create");
  const cwd = options.cwd || process.cwd();
  const appDir = path.resolve(cwd, projectName || ".");

  const validatedResult = validateProjectName(projectName);

  // 包名不合法
  if (!validatedResult.validForNewPackages) {
    error(
      `Invalid project name: "${chalk.green(projectName)}", fllow this resons:`,
      "tag"
    );
    let i = 0;
    validatedResult.errors &&
      validatedResult.errors.forEach((err) => {
        console.error(`${++i}. ${err}`);
      });
    validatedResult.warnings &&
      validatedResult.warnings.forEach((err) => {
        console.error(`${++i}. ${err}`);
      });
    process.exit(1);
  }

  if (fs.existsSync(appDir) && !options.merge) {
    const { ok } = await inquirer.prompt([
      {
        name: "ok",
        type: "confirm",
        message: `Target directory ${appDir} already exists. we will remove this directory, are you sure?`,
      },
    ]);
    if (!ok) {
      return;
    }
    console.log(`\nRemove ${appDir}...`);
    fs.removeSync(appDir);
  }

  // 创建creator
  const creator = new Creator(projectName, appDir);
  creator.create(options);
};

module.exports = function (...args) {
  create(...args).catch((err) => {
    console.error(err);
    if (process.env.WA_DEBUG) {
      process.exit(1);
    }
  });
};
