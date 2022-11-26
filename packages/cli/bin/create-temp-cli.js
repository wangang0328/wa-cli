#! /usr/bin/env node

const slash = require("slash"); // 处理路径 斜杠和反斜杠
const path = require("path");
const fs = require("fs-extra");
// TODO: 校验node版本
// console.log(slash(process.cwd()));
if (
  slash(process.cwd()).indexOf("/packages/test") > 0 &&
  (fs.existsSync(path.resolve(process.cwd()), "../@wa") ||
    fs.existsSync(path.resolve(process.cwd(), "../../@wa")))
) {
  process.env.WA_DEBUG = true;
}

const { Command } = require("commander");
const minimist = require("minimist"); // 命令行解析参数
const packageJson = require("../package");

const program = new Command();

program.version(packageJson.version);

program.version(`@wa/cli ${packageJson.version}`).usage("<command> [options]");

program
  .command("create <app-name>")
  .description("create a name new project template")
  .option(
    "-p, --preset <presetName>",
    "Skip prompts and use saved or remove preset"
  )
  .option("-d, --def-ault", "Skip prompts and use default preset")
  .option("-l, --local", "Module context require local url")
  .option(
    "-g, --git [message]",
    "Force git initialization with initial commit message",
    true
  )
  .option("-n, --no-git", "Skip git initialization")
  .option("--merge", "Merge target directory if it exists")
  .action((name, cmd) => {
    // process.argv 是个数组，第一个是node的程序所在位置，第二个是所执行的文件
    // name 是create的 参数
    if (!minimist(process.argv.slice(3))._.length) {
      console.log(
        "@wa/cli need a project name, place input your project name, check it by wa --help."
      );
      process.exit(1);
    }

    if (process.argv.includes("-g") || process.argv.includes("--git")) {
      options.forceGit = true;
    }
    require("../lib/create")(name, cmd);
  });

program
  .command("add", "add module to exist project")
  .command("delete", "delete a module from project")
  .command("list", "list all the modules");

// 解析命令行参数
program.parse(process.argv);
