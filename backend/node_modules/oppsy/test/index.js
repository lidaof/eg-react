'use strict';

// Load modules
const Events = require('events');
const Fs = require('fs');
const Http = require('http');
const Https = require('https');
const Stream = require('stream');

const Code = require('code');
const Hapi = require('hapi');
const Items = require('items');
const Lab = require('lab');

const Os = require('../lib/os');
const Process = require('../lib/process');
const Network = require('../lib/network');

// Test shortcuts

const lab = exports.lab = Lab.script();
const expect = Code.expect;
const describe = lab.describe;
const it = lab.it;


describe('Oppsy', () => {

    describe('Network', () => {

        it('reports on network activity', (done) => {

            const server = new Hapi.Server();
            server.connection({ host: 'localhost' });
            server.connection({ host: 'localhost' });

            server.route({
                method: 'GET',
                path: '/',
                handler: (request, reply) => {

                    reply();
                }
            });

            const network = new Network(server);
            const agent = new Http.Agent({ maxSockets: Infinity });
            const usedPorts = [];

            server.start(() => {

                server.connections.forEach((conn) => {

                    usedPorts.push(conn.info.port);

                    for (let i = 0; i < 20; ++i) {
                        Http.get({
                            path: '/',
                            host: conn.info.host,
                            port: conn.info.port,
                            agent: agent
                        }, () => {});
                    }
                });

                setTimeout(() => {

                    expect(network._requests).to.have.length(2);

                    let port = usedPorts.shift();

                    while (port) {

                        expect(network._requests[port]).to.exist();
                        expect(network._requests[port].total).to.equal(20);
                        expect(network._requests[port].statusCodes[200]).to.equal(20);
                        expect(network._responseTimes[port]).to.exist();
                        port = usedPorts.shift();
                    }

                    done();
                }, 500);
            });
        });

        it('resets stored statistics', (done) => {

            const server = new Hapi.Server();
            server.connection({ host: 'localhost' });

            server.route({
                method: 'GET',
                path: '/',
                handler: (request, reply) => {

                    reply();
                }
            });

            const network = new Network(server);
            const agent = new Http.Agent({ maxSockets: Infinity });

            server.start(() => {

                for (let i = 0; i < 10; ++i) {
                    Http.get({
                        path: '/',
                        host: server.info.host,
                        port: server.info.port,
                        agent: agent
                    }, () => {});
                }


                setTimeout(() => {

                    const port = server.info.port;

                    expect(network._requests[port]).to.exist();
                    expect(network._requests[port].total).to.equal(10);
                    expect(network._requests[port].statusCodes[200]).to.equal(10);

                    expect(network._responseTimes[port]).to.exist();

                    network.reset();

                    expect(network._requests[port]).to.deep.equal({
                        total: 0,
                        disconnects: 0,
                        statusCodes: {}
                    });

                    expect(network._responseTimes[port]).to.deep.equal({
                        count: 0,
                        total: 0,
                        max: 0
                    });

                    done();
                }, 300);
            });
        });

        it('reports on socket information', { skip: false }, (done) => {

            const server = new Hapi.Server();
            server.connection({ host: 'localhost' });

            const upstream = new Hapi.Server();
            upstream.connection({
                host: 'localhost',
                tls: {
                    key: Fs.readFileSync(process.cwd() + '/test/fixtures/server.key', { encoding: 'utf8' }),
                    cert: Fs.readFileSync(process.cwd() + '/test/fixtures/server.crt', { encoding: 'utf8' })
                }
            });

            upstream.route({
                method: 'GET',
                path: '/',
                handler: (request, reply) => {/* trap the request here */}
            });

            upstream.start(() => {

                const httpAgent = new Http.Agent({ maxSockets: Infinity });
                const httpsAgent = new Https.Agent({ maxSockets: Infinity });
                const network = new Network(server, httpAgent, httpsAgent);

                server.route({
                    method: 'GET',
                    path: '/',
                    handler: (request, reply) => {

                        Https.get({
                            hostname: upstream.info.host,
                            port: upstream.info.port,
                            path: '/',
                            agent: httpsAgent,
                            rejectUnauthorized: false
                        });
                    }
                });

                server.route({
                    method: 'GET',
                    path: '/foo',
                    handler: (request, reply) => {

                        setTimeout(() => {

                            reply();
                        }, Math.floor(Math.random() * 10) + 1);
                    }
                });

                server.start(() => {

                    for (let i = 0; i < 10; ++i) {
                        Http.get({
                            path: '/',
                            host: server.info.host,
                            port: server.info.port,
                            agent: httpAgent
                        });

                        Http.get({
                            path: '/foo',
                            host: server.info.host,
                            port: server.info.port,
                            agent: httpAgent
                        });
                    }

                    setTimeout(() => {

                        Items.parallel.execute({
                            concurrents: network.concurrents.bind(network),
                            response: network.responseTimes.bind(network),
                            sockets: network.sockets.bind(network)
                        }, (err, results) => {

                            const port = server.info.port;

                            expect(err).to.not.exist();
                            expect(results.concurrents[port]).to.be.a.number();

                            expect(results.sockets.http.total).to.be.at.least(10);
                            expect(results.sockets.https.total).to.be.at.least(10);

                            expect(results.response[port].avg).to.be.at.least(1);
                            expect(results.response[port].max).to.be.at.least(1);

                            done();
                        });
                    }, 300);
                });
            });
        });

        it('tracks server disconnects', (done) => {

            class TestStream extends Stream.Readable {
                constructor() {

                    super();
                }
                _read() {

                    if (this.isDone) {
                        return;
                    }

                    this.isDone = true;

                    setTimeout(() => {

                        this.push('Hello');
                    }, 10);

                    setTimeout(() => {

                        this.push(null);
                    }, 50);
                }
            }

            const server = new Hapi.Server();
            server.connection({ host: 'localhost' });

            server.route({
                method: 'POST',
                path: '/',
                handler: (request, reply) => {

                    reply(new TestStream());
                }
            });

            const network = new Network(server);

            server.start(() => {

                const options = {
                    hostname: server.info.host,
                    port: server.info.port,
                    path: '/',
                    method: 'POST'
                };

                const req = Http.request(options, (res) => {

                    req.destroy();
                });

                req.end('{}');
            });

            setTimeout(() => {

                network.requests((err, result) => {

                    expect(err).to.not.exist();
                    const requests = {};
                    requests[server.info.port] = { total: 1, disconnects: 1, statusCodes: { '200': 1 } };

                    expect(result).to.deep.equal(requests);
                    server.stop(done);
                });
            }, 400);
        });

        it('error checks getConnections', (done) => {

            const ee = new Events.EventEmitter();
            ee.connections = [{
                listener: {
                    getConnections: (callback) => {

                        callback(new Error('mock error'));
                    }
                }
            }];
            ee.ext = () => {};

            const network = new Network(ee);

            network.concurrents((err) => {

                expect(err.message).to.equal('mock error');
                done();
            });
        });

        it('does not throw if request.response is null', (done) => {

            const server = new Hapi.Server();
            server.connection({ host: 'localhost' });

            server.route({
                method: 'GET',
                path: '/',
                handler: (request, reply) => {

                    reply();
                }
            });

            // force response to be null to mimic client disconnect
            server.on('response', (request) => {

                request.response = null;
            });

            const network = new Network(server);

            server.start(() => {

                Http.get({
                    path: '/',
                    host: server.info.host,
                    port: server.info.port
                }, () => {

                    expect(network._requests[server.info.port]).to.exist();
                    expect(network._requests[server.info.port].total).to.equal(1);
                    expect(network._requests[server.info.port].statusCodes).to.deep.equal({});
                    done();
                });
            });
        });
    });
    describe('os information', () => {

        describe('mem()', () => {

            it('returns an object with the current memory usage', (done) => {

                Os.mem((err, mem) => {

                    expect(err).to.not.exist();
                    expect(mem).to.exist();
                    expect(mem.total).to.exist();
                    expect(mem.free).to.exist();
                    done();
                });
            });
        });
        describe('loadavg()', () => {

            it('returns an object with the current load average', (done) => {

                Os.loadavg((err, load) => {

                    expect(err).to.not.exist();
                    expect(load).to.have.length(3);
                    done();
                });
            });
        });
        describe('uptime()', () => {

            it('returns an object with the current uptime', (done) => {

                Os.uptime((err, uptime) => {

                    expect(err).to.not.exist();
                    expect(uptime).to.exist();
                    expect(uptime).to.be.a.number();
                    done();
                });
            });
        });
    });
    describe('process information', () => {

        describe('memory()', () => {

            it('passes the current memory usage to the callback', (done) => {

                Process.memoryUsage((err, mem) => {

                    expect(err).not.to.exist();
                    expect(mem).to.exist();
                    done();
                });
            });
        });
        describe('delay()', () => {

            it('passes the current event queue delay to the callback', (done) => {

                Process.delay((err, delay) => {

                    expect(err).not.to.exist();
                    expect(delay).to.exist();
                    done();
                });
            });
        });
    });
});
