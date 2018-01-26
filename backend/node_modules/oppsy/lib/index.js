'use strict';

// Load modules
const Events = require('events');
const Os = require('os');

const Hoek = require('hoek');
const Items = require('items');

const NetworkMonitor = require('./network');
const OsMonitor = require('./os');
const ProcessMonitor = require('./process');

class Oppsy extends Events.EventEmitter {
    constructor(server, config) {

        super();
        config = config || {};
        this._networkMonitor = new NetworkMonitor(server, config.httpAgents, config.httpsAgents);
        this._tasks = {
            osload: OsMonitor.loadavg,
            osmem: OsMonitor.mem,
            osup: OsMonitor.uptime,
            psup: ProcessMonitor.uptime,
            psmem: ProcessMonitor.memoryUsage,
            psdelay: ProcessMonitor.delay,
            requests: this._networkMonitor.requests,
            concurrents: this._networkMonitor.concurrents,
            responseTimes: this._networkMonitor.responseTimes,
            sockets: this._networkMonitor.sockets
        };
    }

    start(interval) {

        Hoek.assert(interval <= 2147483647, 'interval must be less than 2147483648');
        const host = Os.hostname();
        this._interval = setInterval(() => {

            Items.parallel.execute(this._tasks, (error, results) => {

                if (error) {
                    this.emit('error', error);
                }
                else {
                    results.host = host;
                    this.emit('ops', results);
                }
                this._networkMonitor.reset();
            });
        }, interval);
    }

    stop() {

        clearInterval(this._interval);
        this._networkMonitor.reset();
        this.emit('stop');
    }
}

module.exports = Oppsy;
