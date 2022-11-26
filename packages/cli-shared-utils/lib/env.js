const { execSync } = require("child_process");
const LRUCache = require("lru-cache");

let _hasGit;

// 创建一个缓存区， 长度为10， 过期时间1000ms
// 缓存项目的git status状态是否存在
const _gitProjects = new LRUCache({
  max: 10,
  ttl: 1000,
});

// 校验git 是否有安装
module.exports.hasGit = () => {
  try {
    execSync("git --version", { stdio: "ignore" }); // 不在终端输出
    _hasGit = true;
    return _hasGit;
  } catch (error) {
    _hasGit = false;
    return _hasGit;
  }
};

/**
 * 判断你是否已经存在git仓库
 */
module.exports.hasProjectGit = (cwd) => {
  if (_gitProjects.has(cwd)) {
    return _gitProjects.get(cwd);
  }

  let result;
  try {
    execSync("git status", { stdio: "ignore", cwd });
    result = true;
  } catch (error) {
    result = false;
  }
  _gitProjects.set(cwd, result);
  return result;
};
