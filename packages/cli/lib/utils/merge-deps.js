const { warn, semver } = require("@wa-dev/cli-shared-utils");

const isValidRange = (range) => {
  if (typeof range !== "string") {
    return false;
  }

  // console.log(semver);
  const isValidSemver = !!semver.validRange(range);
  const isValidGitHub = range.match(/^[^/]+\/[^/]+/) != null;
  const isValidURI =
    range.match(
      /^(?:file|git|git\+ssh|git\+http|git\+https|git\+file|https?):/
    ) != null;

  return isValidSemver || isValidGitHub || isValidURI;
};

const extractSemver = (r) => r.replace(/^.+#semver:/, "");
const injectSemver = (r, v) =>
  semver.validRange(r) ? v : r.replace(/#semver:.+$/, `#semver:${v}`);

const rangeToVersion = (r) => r.replace(/^(~|\^|>=?)/, "").replace(/x/g, "0");

const tryGeNewRange = (r1, r2) => {
  const v1 = rangeToVersion(r1);
  const v2 = rangeToVersion(r2);
  if (semver.valid(v1) && semver.valid(v2)) {
    return semver.gt(v1, v2) ? r1 : r2;
  }
};

const mergeDeps = (
  depId,
  sourceDeps,
  depsToInject,
  sources,
  { prune, warnIncompatibleVersions }
) => {
  const result = Object.assign({}, sourceDeps);
  for (const depName in depsToInject) {
    const sourceRange = sourceDeps[depName];
    const injectingRange = depsToInject[depName];

    // 如果两个版本一样，跳过本次遍历
    if (sourceRange === injectingRange) continue;

    // 为null的删除
    if (prune && injectingRange === null) {
      delete result[depName];
      continue;
    }
    // 判断版本是否合法
    if (!isValidRange(injectingRange)) {
      warn(
        `invalid version range for dependency "${depName}":\n\n` +
          `- ${injectingRange} injected by generator "${depId}"`
      );
      continue;
    }

    // TODO: sources[depName] 来源, 应该是注入的
    const sourceGeneratorId = sources[depName];
    // console.log("sourceRant=================", sourceRange);
    if (!sourceRange) {
      result[depName] = injectingRange;
      // TODO: 作用
      sources[depName] = depId;
    } else {
      const sourceRangeSemver = extractSemver(sourceRange);
      const injectingRangeSemver = extractSemver(injectingRange);
      // 获取两个的最新版本
      const r = tryGeNewRange(sourceRangeSemver, injectingRangeSemver);
      const didGetNewer = !!r;
      // 如果失败，那么就用一个存在的版本
      result[depName] = didGetNewer
        ? injectSemver(injectingRange, r)
        : sourceRange;

      // if change update source
      if (result[depName] === injectingRange) {
        sources[depName] = depId;
      }

      // warn incompatible version requirements
      if (
        warnIncompatibleVersions &&
        (!semver.validRange(sourceRangeSemver) ||
          !semver.validRange(injectingRangeSemver) ||
          !semver.intersects(sourceRangeSemver, injectingRangeSemver))
      ) {
        warn(
          `conflicting versions for project dependency "${depName}":\n\n` +
            `- ${sourceRange} injected by generator "${sourceGeneratorId}"\n` +
            `- ${injectingRange} injected by generator "${depId}"\n\n` +
            `Using ${didGetNewer ? `newer ` : ``}version (${
              result[depName]
            }), but this may cause build errors.`
        );
      }
    }
  }
  return result;
};

module.exports = mergeDeps;
