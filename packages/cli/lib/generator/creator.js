const EventEmitter = require("events");
const os = require("os");
const deepclone = require("lodash.clonedeep");
const { defaults } = require("../options");
const PackageManager = require("./package-manager");
const Generator = require("./generator");
const writeFileTree = require("../utils/write-file-tree");
const sortObject = require("../utils/sort-object");
const {
  clearConsole,
  hasGit,
  hasProjectGit,
  execa,
  log,
  loadModule,
  chalk,
} = require("@wa-dev/cli-shared-utils");
const getVersions = require("../utils/get-versions");
const path = require("path");

module.exports = class Creator extends EventEmitter {
  constructor(projectName, context) {
    super();
    this.projectName = projectName;
    this.context = context;
  }

  async create(cliOptions, preset = null) {
    const name = this.projectName;
    const context = this.context;
    clearConsole();

    const latestMinor = await getVersions();

    const pkg = {
      name,
      version: "0.0.0",
      private: true,
      devDependencies: {},
    };

    // 收集默认需要安装的依赖或者预设，和cli-service
    if (!preset) {
      preset = defaults.presets.default;
    }

    // 插件的注入逻辑， 确保cli-service脚手架的服务肯定可以注入
    preset = deepclone(preset);
    preset.plugins["@wa-dev/cli-service"] = Object.assign(
      {
        projectName: name,
      },
      preset
    );

    // console.log("preset---", preset.plugins["@wa-dev/cli-service"]);
    // 设置包名、依赖, 将preset的依赖赋值给pkg，后续将pkg写入到package.json 文件
    // 抽离出@wa 开头的依赖，添加版本号，同时为后续解析插件做准备
    const deps = Object.keys(preset.plugins);
    deps.forEach((dep) => {
      pkg.devDependencies[dep] =
        preset.plugins[dep].version ||
        (/^@wa/.test(dep) ? `${latestMinor}` : "latest");
    });

    const pm = new PackageManager(context, { pkg });

    // 写入 package.json
    await writeFileTree(context, {
      "package.json": JSON.stringify(pkg, null, 2) + os.EOL,
    });

    // 校验是否git初始化
    const shouldInitGit = this.shouldInitGit(cliOptions);
    if (shouldInitGit) {
      // TODO: 动画
      // console.log("git K开始");
      await this.run("git init");
      // console.log("git 结束---");
    }
    log(`⚙\u{fe0f}  Installing CLI plugins. This might take a while...`);
    log();
    this.emit("creation", { event: "plugins-install" });

    if (process.env.WA_DEBUG) {
      // 开发环境不远程拉取 cli-service
      console.log(
        `${chalk.blueBright("[wa-cli]: ")}${chalk.yellowBright(
          "开启本地调试模式!\n"
        )}`
      );
      await require("../utils/setup-dev-project.js")(context);
    } else {
      await pm.install();
    }

    // 开始构造项目
    log(`🚀  Invoking generators...`);
    const plugins = await this.resolvePlugins(preset.plugins);
    const generator = new Generator(this.context, {
      name: this.projectName, // 项目名称
      pkg, // package.json 包
      plugins, // 插件
      pm, // PackageManager 包管理器实例
    });
    generator.generate();
    if (!process.env.WA_DEBUG) {
      await pm.install();
    }
    // TODO: 根据命令来
    log(
      `🎉  Successfully created project ${chalk.yellow(this.projectName)}.\n`
    );
    log(`👉  Get started with the following commands:\n\n`);
    log(chalk.cyan(` ${chalk.gray("$")} cd ${this.projectName}\n`));
    log(chalk.cyan(` ${chalk.gray("$")} npm run start\n`));
  }

  shouldInitGit(cliOptions) {
    if (!hasGit()) {
      return false;
    }

    // --no-git
    if ("noGit" in cliOptions) {
      return false;
    }

    // --git
    if (cliOptions.forceGit) {
      return true;
    }

    // default: true unless already in a git repro
    return !hasProjectGit(this.context);
  }

  run(command, args = []) {
    [command, ...args] = command.split(/\s+/).concat(args);
    return execa(command, args, { cwd: this.context });
  }

  // 解析插件
  // { id: options } => [{ id, apply, options }]
  async resolvePlugins(rowPlugins) {
    // ensure cli-service is invoked first and sort
    // 确保@wa-dev/cli-service 插件是被正确添加进去的
    rowPlugins = sortObject(rowPlugins, ["@wa-dev/cli-service"], true);
    // 缓存插件
    const plugins = [];
    // 遍历插件列表
    Object.entries(rowPlugins).forEach(([id, value]) => {
      // 相当于 require(`${id}/generator`) 每个子项目下面会有一个generator文件夹
      // generator/index.js 作为插件的入口， 所以加载入口模块
      // loadModule使用pnpm 报错找不到模块
      // const apply = loadModule(`${id}/lib/generator`, this.context) || (() => {});
      const apply = require(`${id}/lib/generator`) || (() => {});

      // id: 插件的id，apply 执行程序，配置项options
      plugins.push({ id, apply, options: value || {} });
    });
    return plugins;
  }
};
