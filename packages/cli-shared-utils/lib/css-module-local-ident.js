const loaderUtils = require("loader-utils");
const path = require("path");

const getCssModuleLocalIdent = (
  context,
  localIdentName,
  localName,
  options
) => {
  // 判断当前是否以index.module.(less|css|scss|sass) 结尾，如果是使用folder name 否则使用file name
  const fileNameOrFolderName = context.resourcePath.match(
    /index.module.(css|less|sass|scss)$/
  )
    ? "[folder]"
    : "[name]";

  // 根据文件的路径和文件名来创建一个hash，确保其唯一性
  // context.rootContext 项目的根路径
  const hash = loaderUtils.getHashDigest(
    path.posix.relative(context.rootContext, context.resourcePath) + localName,
    "md5",
    "base64",
    5
  );

  // 使用loaderUtils获取 className interpolateName 方法用于生成对应的文件名
  // eg: 第二个参数"js/[hash].script.[ext]" => js/e353f4da4c3e380646d2b4d75c8a13ab.script.js
  const className = loaderUtils.interpolateName(
    context,
    `${fileNameOrFolderName}_${localName}__${hash}`,
    options
  );
  // 去掉类名中的module和. （如果有的话）
  const result = className.replace(".module", "_").replace(/\./g, "_");
  return result;
};

module.exports.getCssModuleLocalIdent = getCssModuleLocalIdent;
