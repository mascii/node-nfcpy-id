'use strict';

const EventEmitter = require('events').EventEmitter;
const PythonShell = require('python-shell');

module.exports = class extends EventEmitter {
    constructor(options) {
      super();
      this.options = options;
      this._running = false;
      this._firstLaunch = false;
      return this;
    }

    get isRunning() {
      return this._running;
    }

    once() {
      const scriptFile = 'scriptFile' in (this.options || {}) ?
                              this.options.scriptFile : 'reader.py';
      const scriptPath = 'scriptPath' in (this.options || {}) ?
                              this.options.scriptPath : __dirname;
      this.pyshell = new PythonShell(scriptFile, {scriptPath}, {mode: 'JSON'});

      this.pyshell.stdout.on('data', (json) => {
        if (this.isRunning) {
          const data = JSON.parse(json.split('\n')[0]);
          this.emit(data.event, data);
        }
      });

      this.pyshell.end((err) => {
        this._running = false;
        this.emit('error', err);
      });

      ['SIGHUP', 'SIGINT', 'exit'].forEach((event) => {
        process.on(event, () => {
          this.sendSignal();
        });
      });
    }

    start() {
      if (this.isRunning) {
        return this;
      }
      this._running = true;

      if (!this._firstLaunch) {
        this.once();
        this._firstLaunch = true;
      } else {
        this.sendSignalForHandler();
      }

      return this;
    }

    stop() {
      if (!this.isRunning) {
        return this;
      }
      this._running = false;
      this.sendSignalForHandler();
      return this;
    }

    sendSignal(signal) {
      this.pyshell.childProcess.kill(signal);
    }

    sendSignalForHandler() {
      this.sendSignal('SIGCHLD');
    }
}
