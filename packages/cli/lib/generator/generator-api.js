/**
 * 用来抛出一些原构造器的方法， 提供外部的plugins使用，任其apply调用此实例
 */
const deepmerge = require("deepmerge");
const mergeDeps = require("../utils/merge-deps");

const isString = (val) => typeof val === "string";
const isFunction = (val) => typeof val === "function";
const isObject = (val) => val && typeof val === "object";
const isArray = (val) => Array.isArray(val);
const mergeArrayWithDedupe = (a, b) => Array.from(new Set([...a, ...b]));

// 判断是否是纯粹的对象，也就是通过 {} new Object() Object.create(null) 创建的对象
const isPlainObject = (obj) => {
  if (!isObject(obj)) return false;
  let proto = obj;
  // 比如[]的原型链 []=>Array.protoype=>Object.getPrototype => null
  // {} => Object.prototype => null
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }
  return Object.getPrototypeOf(obj) === proto;
};

module.exports = class GeneratorApi {
  constructor(id, generator, pluginOptions) {
    // 插件id
    this.id = id;
    // 插件构造器实例
    this.generator = generator;
    // 插件设置
    this.pluginOptions = pluginOptions;
  }

  /**
   * 扩展package
   * @param {Object|Function} fields
   * @param {Object|Boolean} options
   */
  extendPackage(fields, options = {}) {
    console.log("----------");
    const extendOptions = {
      merge: true,
      warnIncomplatiableVersions: true,
      forceOverwrite: true,
      ...options,
    };
    // pkg信息重generator中获取
    const pkg = this.generator.pkg;
    const toMerge = isFunction(fields) ? fields(pkg) : fields;

    // 扩展package.json 内容
    for (const key in toMerge) {
      const value = toMerge[key];
      // 是否存在pkg包
      const existing = pkg[key];
      // 判断对象是否是一般对象，并且是依赖dep对象
      if (
        isPlainObject(value) &&
        (key === "dependencies" || key === "devDependencies")
      ) {
        // 如果是dependencies 对象 直接合并
        pkg[key] = mergeDeps(
          this.id,
          existing || {},
          value,
          this.generator.depSources,
          extendOptions
        );
      } else if (!extendOptions.merge || !(key in pkg)) {
        // 不合并的情景
        pkg[key] = value;
      } else if (isArray(value) && isArray(existing)) {
        // 合并数组
        pkg[key] = mergeArrayWithDedupe(existing, value);
      } else if (isObject(value) && isObject(existing)) {
        pkg[key] = deepmerge(existing, value, {
          arrayMerge: mergeArrayWithDedupe,
        });
      } else {
        pkg[key] = value;
      }
    }
  }
};
