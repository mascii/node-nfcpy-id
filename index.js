'use strict';

const EventEmitter = require('events').EventEmitter;
const PythonShell = require('python-shell');

const killProcess = (pyshell) => {
  pyshell.childProcess.kill('SIGHUP');
}

module.exports = class NfcpyId extends EventEmitter {
    constructor(options) {
        super();
        const scriptFile = 'scriptFile' in (options || {}) ?
                                options.scriptFileName : 'reader.py';
        const scriptPath = 'scriptPath' in (options || {}) ?
                                options.scriptPath : __dirname;
        const pyshell = new PythonShell(scriptFile, {scriptPath}, {mode: 'JSON'});

        pyshell.stdout.on('data', (json) => {
          const data = JSON.parse(json.split('\n')[0]);
          this.emit(data.event, data);
        });

        pyshell.end((err) => {
          this.emit('err', err);
        });

        process.on('SIGHUP', () => {killProcess(pyshell)});
        process.on('SIGINT', () => {killProcess(pyshell)});
    }
}
