const url = require("url");
const { chalk } = require("@wa-dev/cli-shared-utils");
const address = require("address");
const defaultGateway = require("default-gateway"); // 默认网关

function prepareUrl(protocol, host, port, pathname = "/") {
  const formatUrl = (hostname) =>
    url.format({
      protocol,
      hostname,
      port,
      pathname,
    });

  const prettyPrintUrl = (hostname) =>
    url.format({
      protocol,
      hostname,
      port: chalk.bold(port),
      pathname,
    });
  // 未知域名
  const isUnspecifiedHost = host === "0.0.0.0" || host === "::";

  let prettyHost, lanUrlForConfig;
  let lanUrlForTerminal = chalk.gray("unavailable"); // 默认在终端显示的局域网地址

  if (isUnspecifiedHost) {
    prettyHost = "localhost";
    try {
      // 局域网地址解析只能是v4
      const result = defaultGateway.v4.sync();
      // 局域网地址信息
      lanUrlForConfig = address.ip(result?.interface);
      if (lanUrlForConfig) {
        // 检查是否是ipv4的私有地址
        // ip段在 A类：10.0.0.0—10.255.255.255 B类：172.16.0.0—172.31.255.555 C类：192.168.0.0—192.168.255.255
        // https://en.wikipedia.org/wiki/Private_network#Private_IPv4_address_spaces
        if (
          /^10[.]|^172[.](1[6-9]|2[0-9]|3[0-1])[.]|^192[.]168[.]/.test(
            lanUrlForConfig
          )
        ) {
          // 如果是ipv4私有地址
          lanUrlForTerminal = prettyPrintUrl(lanUrlForConfig);
        } else {
          // ipv4不是私有的，则抛弃改成未定义
          lanUrlForConfig = undefined;
        }
      }
    } catch (error) {
      // do nothing
    }
  } else {
    lanUrlForConfig = host;
    prettyHost = host;
    lanUrlForTerminal = prettyPrintUrl(host);
  }

  return {
    lanUrlForConfig,
    lanUrlForTerminal,
    localUrlForTerminal: prettyPrintUrl(prettyHost),
    localUrlForBrowser: formatUrl(prettyHost),
  };
}

module.exports = prepareUrl;
