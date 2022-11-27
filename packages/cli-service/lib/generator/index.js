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
      "@wa-dev/cli-service": "2.0.0-beat.5",
      typescript: "^4.9.3",
    },
    browserslist: [">1%", "not dead", "not op_mini all"],
  });
};
