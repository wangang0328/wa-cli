const Module = require("module");
const path = require("path");
const semver = require("semver");

// 兼容不同node版本的模块加载方式， 返回require函数
const createRequire =
  Module.createRequire ||
  Module.createRequireFromPath ||
  ((filename) => {
    const mod = new Module(filename, null);
    mod.filename = filename;
    mod.paths = Module._nodeModulePaths(path.dirname(filename));
    mod._compile(`module.exports = require;`, filename);

    return mod.exports;
  });

function resolveFallback(request, options) {
  const isMain = false;
  const fakeParent = new Module("", null);

  const paths = [];

  for (let i = 0; i < options.paths.length; i++) {
    const p = options.paths[i];
    fakeParent.paths = Module._nodeModulePaths(p);
    const lookupPaths = Module._resolveLookupPaths(request, fakeParent, true);

    if (!paths.includes(p)) paths.push(p);

    for (let j = 0; j < lookupPaths.length; j++) {
      if (!paths.includes(lookupPaths[j])) paths.push(lookupPaths[j]);
    }
  }

  const filename = Module._findPath(request, paths, isMain);
  if (!filename) {
    const err = new Error(`Cannot find module '${request}'`);
    err.code = "MODULE_NOT_FOUND";
    throw err;
  }
  return filename;
}

const resolve = semver.satisfies(process.version, ">=10.0.0")
  ? require.resolve
  : resolveFallback;

// 返回加载模块的路径
exports.resolveModule = function (request, context) {
  // createRequire doesn't work with jest mock modules
  // (which we used in migrator for inquirer, and in tests for cli-service)
  // TODO: it's supported in Jest 25
  if (
    process.env.WA_DEBUG &&
    (request.endsWith("migrator") || context === "/")
  ) {
    return request;
  }

  let resolvedPath;
  try {
    try {
      resolvedPath = createRequire(
        path.resolve(context, "package.json")
      ).resolve(request);
    } catch (e) {
      resolvedPath = resolve(request, { paths: [context] });
    }
  } catch (e) {}
  return resolvedPath;
};

// 加载模块
exports.loadModule = function (request, context, forceClearCache = false) {
  // createRequire doesn't work with jest mocked fs
  // (which we used in tests for cli-service)
  if (process.env.WA_DEBUG && context === "/") {
    return require(request);
  }

  try {
    return createRequire(path.resolve(context, "package.json"))(request);
  } catch (e) {
    console.log(e);
    const resolvedPath = exports.resolveModule(request, context);
    if (resolvedPath) {
      if (forceClearCache) {
        clearRequireCache(resolvedPath);
      }
      return require(resolvedPath);
    }
  }
};

exports.clearModule = function (request, context) {
  const resolvedPath = exports.resolveModule(request, context);
  if (resolvedPath) {
    clearRequireCache(resolvedPath);
  }
};

// 清空require的引用缓存
function clearRequireCache(id, map = new Map()) {
  const module = require.cache[id];
  if (module) {
    map.set(id, true);
    // Clear children modules
    module.children.forEach((child) => {
      // 如果子modules没有被标记，继续递归清空缓存
      if (!map.get(child.id)) clearRequireCache(child.id, map);
    });
    delete require.cache[id];
  }
}
