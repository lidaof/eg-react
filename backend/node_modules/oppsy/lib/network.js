'use strict';

// Load modules

const Http = require('http');
const Https = require('https');

const Hoek = require('hoek');
const Items = require('items');

class Network {
    constructor(server, httpAgents, httpsAgents) {

        this._requests = {};
        this._responseTimes = {};
        this._server = server;
        this._httpAgents = [].concat(httpAgents || Http.globalAgent);
        this._httpAgents = [].concat(httpsAgents || Https.globalAgent);

        this._server.on('request-internal', (request, event, tags) => {

            const port = request.connection.info.port;

            if (tags.received) {
                this._requests[port] = this._requests[port] || { total: 0, disconnects: 0, statusCodes: {} };
                this._requests[port].total++;

                request.once('disconnect', () => {

                    this._requests[port].disconnects++;
                });
            }
        });
        this._server.on('response', (request) => {

            const msec = Date.now() - request.info.received;
            const port = request.connection.info.port;
            const statusCode = request.response && request.response.statusCode;

            const portResponse = this._responseTimes[port] = (this._responseTimes[port] || { count: 0, total: 0, max: 0 });
            portResponse.count++;
            portResponse.total += msec;

            if (portResponse.max < msec) {
                portResponse.max = msec;
            }

            if (statusCode) {
                this._requests[port].statusCodes[statusCode] = this._requests[port].statusCodes[statusCode] || 0;
                this._requests[port].statusCodes[statusCode]++;
            }
        });

        this.requests = (callback) => {

            callback(null, this._requests);
        };

        this.concurrents = (callback) => {

            const result = {};

            Items.serial(this._server.connections, (connection, next) => {

                connection.listener.getConnections((err, count) => {

                    if (err) {
                        return next(err);
                    }

                    result[connection.info.port] = count;
                    next();
                });
            }, (err) => {

                callback(err, result);
            });
        };

        this.responseTimes = (callback) => {

            const ports = Object.keys(this._responseTimes);
            const overview = {};
            for (let i = 0; i < ports.length; ++i) {
                const port = ports[i];
                const count = Hoek.reach(this, `_responseTimes.${port}.count`, { default: 1 });
                overview[port] = {
                    avg: this._responseTimes[port].total / count,
                    max: this._responseTimes[port].max
                };
            }

            return callback(null, overview);
        };

        this.sockets = (callback) => {

            const result = {
                http: Network.getSocketCount(this._httpAgents),
                https: Network.getSocketCount(this._httpAgents)
            };
            callback(null, result);
        };

        this.reset = () => {

            const ports = Object.keys(this._requests);
            for (let i = 0; i < ports.length; ++i) {
                this._requests[ports[i]] = { total: 0, disconnects: 0, statusCodes: {} };
                this._responseTimes[ports[i]] = { count: 0, total: 0, max: 0 };
            }
        };
    }

    static getSocketCount(agents) {

        const result = {
            total: 0
        };

        for (let i = 0; i < agents.length; ++i) {
            const agent = agents[i];

            const keys = Object.keys(agent.sockets);
            for (let j = 0; j < keys.length; ++j) {
                const key = keys[j];
                result[key] = agent.sockets[key].length;
                result.total += result[key];
            }
        }

        return result;
    }
}

module.exports = Network;
