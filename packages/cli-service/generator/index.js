module.exports = (api) => {
  // TODO: 获取最新版本
  api.extendPackage({
    scripts: {
      start: "wa-cli-service start",
      build: "wa-cli-service build",
    },
    dependencies: {
      react: "^18.2.0",
      "react-dom": "^18.2.0",
    },
    browserslist: [">1%", "not dead", "not op_mini all"],
  });
};
