const path = require("path");
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
    devDependencies: {
      "@types/react": "^18.0.25",
      "@types/react-dom": "^18.0.9",
      "eslint-config-standard": "^17.0.0",
      "eslint-plugin-import": "^2.26.0",
      "eslint-plugin-n": "^15.5.1",
      "eslint-plugin-node": "^11.1.0",
      "eslint-plugin-promise": "^6.1.1",
    },
    browserslist: [">1%", "not dead", "not op_mini all"],
  });
  api.setBaseInfo({
    template: {
      basePath: path.resolve(__dirname, "./template"),
    },
  });
};
