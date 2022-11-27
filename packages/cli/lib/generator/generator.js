const { isBinaryFileSync } = require("isbinaryfile");
const fs = require("fs-extra");
const path = require("path");
const globby = require("globby"); // 查找加载文件
const GeneratorAPI = require("./generator-api");
const writeFileTree = require("../utils/write-file-tree");
// const templatePath = "../../../cli-service/generator/template";

const renderFile = (name) => {
  // 如果是二进制文件（eg：favicon.ico）
  if (isBinaryFileSync(name)) {
    return fs.readFileSync(name); // 二进制流
  }
  return fs.readFileSync(name, "utf-8");
};

module.exports = class Generator {
  constructor(context, { pkg, plugins, pm }) {
    this.context = context;
    this.pkg = pkg;
    this.plugins = plugins;
    this.pm = pm;
    this.depSources = {};
  }

  // 解析plugins
  async initPlugins() {
    for (const plugin of this.plugins) {
      console.log("执行插件");
      const { id, apply, options } = plugin;
      const api = new GeneratorAPI(id, this, options);
      await apply(api, options);
    }
  }

  async generate() {
    // 初始化构造器的时候，初始化插件
    this.initPlugins();
    const baseDir = path.resolve(
      __dirname,
      "../../node_modules/@wa-dev/cli-service/lib/generator/template"
    );
    // dot: true 匹配以点开头的文件
    const _files = await globby(["**"], { cwd: baseDir, dot: true });
    const filesContentTree = _files.reduce((content, sorucePath) => {
      content[sorucePath] = renderFile(path.resolve(baseDir, sorucePath));
      return content;
    }, {});
    // 保存package.json 文件
    filesContentTree["package.json"] = JSON.stringify(this.pkg, null, 2) + "\n";
    await writeFileTree(this.context, filesContentTree);
  }
};
