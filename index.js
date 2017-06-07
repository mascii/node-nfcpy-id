'use strict';

const EventEmitter = require('events').EventEmitter;
const PythonShell = require('python-shell');

module.exports = class extends EventEmitter {
    constructor(options) {
      super();
      this._options = options;
      this._mode = 'mode' in (options || {}) ? options.mode : 'loop';
      this._running = false;
      this._exiting = false;
      this._firstLaunch = false;

      if (this._mode === 'non-loop') {
        this._loop = false;
        this._non_touchend = false;
      } else if (this._mode === 'non-touchend') {
        this._loop = false;
        this._non_touchend = true;
      } else {
        this._loop = true;
        this._non_touchend = false;
      }

      ['SIGHUP', 'SIGINT', 'exit'].forEach((event) => {
        process.on(event, () => {
          if (this._firstLaunch) {
            this._exiting = true;
            this.sendSignal('SIGHUP');
            console.log("aaaaaa");
          }
        });
      });

      return this;
    }

    get isRunning() {
      return this._running;
    }

    once() {
      const scriptFile = 'scriptFile' in (this._options || {}) ?
                              this._options.scriptFile : 'reader.py';
      const scriptPath = 'scriptPath' in (this._options || {}) ?
                              this._options.scriptPath : __dirname;
      const args = [this._mode];
      this.pyshell = new PythonShell(scriptFile, {scriptPath, args}, {mode: 'JSON'});

      this.pyshell.stdout.on('data', (json) => {
        if (this.isRunning) {
          const data = JSON.parse(json.split('\n')[0]);
          this._running = this._loop || !this._non_touchend && !(data.event === 'touchend');
          this.emit(data.event, data);
        }
      });

      this.pyshell.end((err) => {
        if (!this._exiting) {
          this._running = false;
          this._firstLaunch = false;
          this.emit('error', err);
        }
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
        this.sendSignal('SIGCHLD');
      }

      return this;
    }

    pause() {
      if (!this.isRunning) {
        return this;
      }
      this._running = false;
      this.sendSignal('SIGCHLD');
      return this;
    }

    sendSignal(signal) {
      this.pyshell.childProcess.kill(signal);
    }
}
