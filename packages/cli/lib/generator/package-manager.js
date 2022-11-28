const { executeCommand } = require("../utils/execute-command");

const PACKAGE_MANAGER_CONFIG = {
  npm: {
    install: ["install", "--loglevel", "error"],
    add: ["install", "--loglevel", "error"],
    remove: ["uninstall", "--loglevel", "error"],
    upgrade: ["update", "--logevel", "error"],
  },
  pnpm: {
    // 第一个参数的意思是普通报错不显示，第二个参数是创建一个扁平node_modules 目录结构
    // install: ["install", "--reporter", "silent", "--shamefully-hoist"],
    install: ["install", "--shamefully-hoist"],
    add: ["install", "--reporter", "silent", "--shamefully-hoist"],
    upgrade: ["update", "--reporter", "silent"],
    remove: ["uninstall", "--reporter", "silent"],
  },
};

// TODO: 扩展命令
module.exports = class PackageManager {
  constructor(context, { pkg }) {
    this.context = context;
    this.pkg = pkg;
    // TODO: 支持yarn pnpm
    this.bin = "pnpm";
  }

  runCommand(command, args) {
    return executeCommand(
      this.bin,
      [...PACKAGE_MANAGER_CONFIG[this.bin][command], ...(args || [])],
      this.context
    );
  }

  install() {
    return this.runCommand("install");
  }

  add(...packages) {
    return this.runCommand("add", packages);
  }

  remove(packageName) {
    return this.runCommand("remove", [packageName]);
  }
};
