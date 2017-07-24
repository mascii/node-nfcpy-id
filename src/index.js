import { EventEmitter } from 'events';
import PythonShell from 'python-shell';

export default class NodeNfcpyId extends EventEmitter {
  constructor(options) {
    super();
    this._options = options;
    this._mode = 'mode' in (options || {}) ? options.mode : 'loop';
    this._running = false;
    this._exiting = false;
    this._firstLaunch = false;

    if (this._mode === 'non-loop') {
      this._loop = false;
      this._nonTouchend = false;
    } else if (this._mode === 'non-touchend') {
      this._loop = false;
      this._nonTouchend = true;
    } else {
      this._loop = true;
      this._nonTouchend = false;
    }

    ['SIGHUP', 'SIGINT', 'SIGTERM', 'exit'].forEach((event) => {
      process.once(event, () => {
        if (this._firstLaunch) {
          this._exiting = true;
          this._sendSignal('SIGHUP');
        }
      });
    });

    return this;
  }

  get isRunning() {
    return this._running;
  }

  _once() {
    if (('scriptFile' in (this._options || {})) || ('scriptPath' in (this._options || {}))) {
      const scriptFile = 'scriptFile' in (this._options || {}) ?
                                this._options.scriptFile : 'reader.py';
      const scriptPath = 'scriptPath' in (this._options || {}) ?
                                this._options.scriptPath : __dirname;
      const options = { scriptPath, args: this._mode, mode: 'text' };
      this.pyshell = new PythonShell(scriptFile, options);
    } else {
      const options = { pythonOptions: ['-m'], args: this._mode, mode: 'text' };
      this.pyshell = new PythonShell('nfcpy_id_reader', options);
    }

    this.pyshell.stdout.on('data', (json) => {
      if (this.isRunning) {
        const data = JSON.parse(json.split('\n')[0]);
        this._running = this._loop || (!this._nonTouchend && !(data.event === 'touchend'));
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

  _sendSignal(signal) {
    this.pyshell.childProcess.kill(signal);
  }

  start() {
    if (this.isRunning) {
      return this;
    }
    this._running = true;

    if (!this._firstLaunch) {
      this._once();
      this._firstLaunch = true;
    } else {
      this._sendSignal('SIGCHLD');
    }

    return this;
  }

  pause() {
    if (!this.isRunning) {
      return this;
    }
    this._running = false;
    this._sendSignal('SIGCHLD');
    return this;
  }
}
