'use strict';

const EventEmitter = require('events').EventEmitter;
const PythonShell = require('python-shell');

module.exports = class extends EventEmitter {
    constructor(options) {
      super();
      this.options = options;
      this._running = false;

      ['SIGHUP', 'SIGINT', 'exit'].forEach((event) => {
        process.on(event, () => {
          this.stop();
        });
      });

      return this;
    }

    start() {
      if (this._running) {
        return this;
      }
      this._running = true;

      const scriptFile = 'scriptFile' in (this.options || {}) ?
                              this.options.scriptFile : 'reader.py';
      const scriptPath = 'scriptPath' in (this.options || {}) ?
                              this.options.scriptPath : __dirname;
      this.pyshell = new PythonShell(scriptFile, {scriptPath}, {mode: 'JSON'});

      this.pyshell.stdout.on('data', (json) => {
        if (this._running) {
          const data = JSON.parse(json.split('\n')[0]);
          this.emit(data.event, data);
        }
      });

      this.pyshell.end((err) => {
        this.emit('error', err);
      });

      return this;
    }

    stop() {
      if (!this._running) {
        return this;
      }
      this._running = false;

      this.pyshell.childProcess.kill('SIGHUP');
      return this;
    }
}
