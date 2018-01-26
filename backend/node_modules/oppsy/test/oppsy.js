'use strict';

// Load modules
const Os = require('os');

const Code = require('code');
const Hapi = require('hapi');
const Lab = require('lab');

const Network = require('../lib/network');
const Oppsy = require('../lib');


// Test shortcuts

const lab = exports.lab = Lab.script();
const expect = Code.expect;
const describe = lab.describe;
const it = lab.it;

describe('Oppsy', () => {

    describe('constructor()', () => {

        it('is an event EventEmitter', (done) => {

            const opps = new Oppsy(new Hapi.Server(), {});
            expect(opps.emit).to.be.a.function();
            expect(opps.on).to.be.a.function();
            done();
        });
        it('creates a network monitor and a map of tasks', (done) => {

            const opps = new Oppsy(new Hapi.Server());
            expect(opps._networkMonitor).to.be.an.instanceof(Network);
            expect(opps._tasks).to.include(['osload','osmem','osup','psup','psmem','psdelay','requests','concurrents','responseTimes','sockets']);
            done();
        });
    });
    describe('start()', () => {

        it('emits an "ops" event at the specified interval', (done) => {

            let count = 0;
            const host = Os.hostname();
            const opps = new Oppsy(new Hapi.Server());
            opps._tasks = {
                one: (callback) => {

                    return callback(null, 'foo');
                },
                two: (callback) => {

                    setTimeout(() => {

                        return callback(null, 'bar');
                    }, 40);
                }
            };

            opps.on('ops', (data) => {

                count++;
                expect(data).to.deep.equal({
                    one: 'foo',
                    two: 'bar',
                    host
                });
                if (count >= 2) {
                    opps.stop();
                }
            });
            opps.on('stop', done);

            opps.start(100);
        });
        it('emits an error if one occurs during processing', (done) => {

            let count = 0;
            const host = Os.hostname();
            const opps = new Oppsy(new Hapi.Server());

            opps._tasks = {
                one: (callback) => {

                    return callback(null, 'foo');
                },
                two: (callback) => {

                    if (count % 2 === 0) {
                        return callback(new Error('there was an error'));
                    }
                    callback(null, 'bar');
                }
            };

            opps.on('ops', (data) => {

                count++;
                expect(data).to.deep.equal({
                    one: 'foo',
                    two: 'bar',
                    host
                });
            });
            opps.on('error', (error) => {

                expect(error).to.be.an.instanceof(Error);
                expect(error.message).to.equal('there was an error');
                opps.stop();
                done();
            });

            opps.start(100);
        });
        it('does not emit the event after it is stopped', (done) => {

            let count = 0;
            const opps = new Oppsy(new Hapi.Server());

            opps._tasks = {
                one: (callback) => {

                    return callback(null, 'foo');
                }
            };
            opps.on('ops', () => {

                count++;
            });
            opps.start(100);
            opps.stop();
            setTimeout(() => {

                expect(count).to.equal(0);
                done();
            }, 500);
        });
    });

    it('emits "ops" events with data', (done) => {

        let _data = {};
        const server = new Hapi.Server();
        server.connection({ host: 'localhost' });

        const opps = new Oppsy(new Hapi.Server());

        opps.on('ops', (data) => {

            _data = data;
        });
        opps.start(100);
        setTimeout(() => {

            expect(_data.requests).to.deep.equal({});
            expect(_data.concurrents).to.deep.equal({});
            expect(_data.responseTimes).to.deep.equal({});
            expect(_data.sockets).to.deep.equal({
                http: { total: 0 },
                https: { total: 0 }
            });
            expect(_data.osload).to.have.length(3);
            expect(_data.osmem).to.contain('total', 'free');
            expect(_data).to.contain('osup', 'psup', 'psdelay', 'host');
            expect(_data.psmem).to.contain('rss', 'heapTotal', 'heapUsed');
            done();
        }, 500);
    });
});
