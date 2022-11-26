const { semver } = require("@wa-dev/cli-shared-utils");

let sessionCached;

// TODO: 后续增加远程获取版本
const getVersions = async () => {
  if (sessionCached) {
    return sessionCached;
  }
  const local = require("../../package.json").version;
  return local;
};

module.exports = getVersions;
