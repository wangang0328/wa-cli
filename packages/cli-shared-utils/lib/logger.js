const chalk = require("chalk");
const readline = require("readline");
const stripAnsi = require("strip-ansi"); // 从字符串中去掉ANSI转义码
// const EventEmitter = require('events')

// exports.event = new EventEmitter()

const format = (label, msg = "") => {
  return msg
    .split("\n")
    .map((line, i) => {
      // console.log(stripAnsi(label).length, line.length);
      return i === 0
        ? `${label} ${line}`
        : line.padStart(stripAnsi(label).length + line.length + 1); // 对齐文本输出内容
    })
    .join("\n");
};

const chalkTag = (msg) => chalk.bgBlackBright.white.dim(` ${msg} `);

exports.log = (msg = "", tag = null) => {
  tag ? console.log(format(chalkTag(tag), msg)) : console.log(msg);
};

exports.info = (msg, tag = null) => {
  console.log(
    format(chalk.bgBlue.black(" INFO ") + (tag ? chalkTag(tag) : ""), msg)
  );
};

exports.done = (msg, tag = null) => {
  console.log(
    format(chalk.bgGreen.black(" DONE ") + (tag ? chalkTag(tag) : ""), msg)
  );
};

exports.warn = (msg, tag = null) => {
  console.warn(
    format(
      chalk.bgYellow.black(" WARN ") + (tag ? chalkTag(tag) : ""),
      chalk.yellow(msg)
    )
  );
};

exports.error = (msg, tag = null) => {
  // stopSpinner();
  console.error(
    format(chalk.bgRed(" ERROR ") + (tag ? chalkTag(tag) : ""), chalk.red(msg))
  );
  if (msg instanceof Error) {
    console.error(msg.stack);
  }
};

// 这个和在终端运行clear命令没啥区别吧
exports.clearConsole = (title) => {
  // 根据isTTY判断是否位于终端上下文
  if (process.stdout.isTTY) {
    // repeat 重复次数
    const blank = "\n".repeat(process.stdout.rows);
    console.log(blank);
    // 光标到00行
    readline.cursorTo(process.stdout, 0, 0);
    // 从光标的当前位置向下清除给定的TTY流， 注释它好像也没啥影响
    readline.clearScreenDown(process.stdout);
    if (title) {
      console.log(title);
    }
  }
};
