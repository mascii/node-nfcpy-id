/// <reference types="node" />
import { EventEmitter } from 'events';
export interface Options {
    scriptFile?: string;
    scriptPath?: string;
    mode?: string;
}
export default class NodeNfcpyId extends EventEmitter {
    private _options;
    private _mode;
    private _running;
    private _exiting;
    private _firstLaunch;
    private _loop;
    private _nonTouchend;
    private _pyshell;
    constructor(options?: Options);
    readonly isRunning: boolean;
    start(): this;
    pause(): this;
    private _once();
    private _sendSignal(signal);
}
