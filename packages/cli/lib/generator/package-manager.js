const { executeCommand } = require("../utils/execute-command");

const PACKAGE_MANAGER_CONFIG = {
  npm: {
    install: ["install", "--loglevel", "error"],
    add: ["install", "--loglevel", "error"],
    remove: ["uninstall", "--loglevel", "error"],
    upgrade: ["update", "--logevel", "error"],
  },
};

// TODO: 扩展命令
module.exports = class PackageManager {
  constructor(context, { pkg }) {
    this.context = context;
    this.pkg = pkg;
    // TODO: 支持yarn pnpm
    this.bin = "npm";
  }

  async runCommand(command, args) {
    return await executeCommand(
      this.bin,
      [...PACKAGE_MANAGER_CONFIG[this.bin][command], ...(args || [])],
      this.context
    );
  }

  install() {
    this.runCommand("install");
  }

  add(...packages) {
    this.runCommand("add", packages);
  }

  remove(packageName) {
    this.runCommand("remove", [packageName]);
  }
};
