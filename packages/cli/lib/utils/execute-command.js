const { execa } = require("@wa-dev/cli-shared-utils");
const EventEmitter = require("events");

// TODO: 确认其作用
class InstallProgress extends EventEmitter {
  constructor() {
    super();
    this._progress = -1;
  }

  get progress() {
    return this._progress;
  }

  set progress(value) {
    this._progress = value;
    this.emit("progress", value);
  }

  get enabled() {
    return this._progress !== -1;
  }

  set enabled(value) {
    // 下面这个是不是相当于 this._progress = value ? 0 : -1
    this.progress = value ? 0 : -1;
  }

  log(value) {
    this.emit(value);
  }
}

const progress = (exports.progress = new InstallProgress());

const executeCommand = (command, args, cwd) => {
  return new Promise((resolve, reject) => {
    progress.enabled = false;

    const child = execa(command, args, {
      cwd,
      // stdio: ['inherit', apiMode ? 'pipe' : 'inherit', !apiMode && command === 'yarn' ? 'pipe' : 'inherit']
      stdio: ["inherit", "inherit", "inherit"],
    });

    child.on("close", (code) => {
      if (code !== 0) {
        reject(`command failed: ${command} ${args.join(" ")}`);
        return;
      }
      resolve();
    });
  });
};

exports.executeCommand = executeCommand;
