const fs = require("fs-extra");
const path = require("path");

/**
 *
 * @param {string} dir  路径
 * @param {Record<string, string>} files 要写入的文件
 */
const writeFileTree = async (dir, files) => {
  Object.entries(files).forEach(([filename, fileContent]) => {
    const targetName = filename === "gitignore" ? ".gitignore" : filename;
    const filePath = path.join(dir, targetName);
    fs.ensureDirSync(path.dirname(filePath));
    fs.writeFileSync(filePath, fileContent);
  });
};

module.exports = writeFileTree;
