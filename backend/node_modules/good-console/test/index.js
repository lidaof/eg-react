'use strict';

// Load modules


const Lab = require('lab');
const Moment = require('moment');

const Streams = require('./fixture/streams');
const GoodConsole = require('..');

// Declare internals

const internals = {
    defaults: {
        format: 'YYMMDD/HHmmss.SSS'
    }
};

internals.ops = {
    event: 'ops',
    timestamp: 1458264810957,
    host: 'localhost',
    pid: 64291,
    os: {
        load: [1.650390625, 1.6162109375, 1.65234375],
        mem: { total: 17179869184, free: 8190681088 },
        uptime: 704891
    },
    proc: {
        uptime: 6,
        mem: {
            rss: 30019584,
            heapTotal: 18635008,
            heapUsed: 9989304
        },
        delay: 0.03084501624107361
    },
    load: {
        requests: {},
        concurrents: {},
        responseTimes: {},
        responseSentTimes: {},
        listener: {},
        sockets: { http: {}, https: {} }
    }
};

internals.response = {
    event: 'response',
    timestamp: 1458264810957,
    id: '1458264811279:localhost:16014:ilx17kv4:10001',
    instance: 'http://localhost:61253',
    labels: [],
    method: 'post',
    path: '/data',
    query: {
        name: 'adam'
    },
    responseTime: 150,
    responseSentTime: 100,
    statusCode: 200,
    pid: 16014,
    httpVersion: '1.1',
    source: {
        remoteAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.87 Safari/537.36',
        referer: 'http://localhost:61253/'
    }
};

internals.request = {
    event: 'request',
    timestamp: 1458264810957,
    tags: ['user', 'info'],
    data: 'you made a request',
    pid: 64291,
    id: '1419005623332:new-host.local:48767:i3vrb3z7:10000',
    method: 'get',
    path: '/'
};

internals.error = {
    event: 'error',
    timestamp: 1458264810957,
    id: '1419005623332:new-host.local:48767:i3vrb3z7:10000',
    tags: ['user', 'info'],
    url: 'http://localhost/test',
    method: 'get',
    pid: 64291,
    error: {
        message: 'Just a simple error',
        stack: 'Error: Just a simple Error'
    }
};

internals.default = {
    event: 'request',
    timestamp: 1458264810957,
    tags: ['user', 'info'],
    data: 'you made a default',
    pid: 64291
};

// Test shortcuts

const lab = exports.lab = Lab.script();
const expect = lab.expect;
const describe = lab.describe;
const it = lab.it;

describe('GoodConsole', () => {

    describe('report', () => {

        describe('response events', () => {

            it('returns a formatted string for "response" events', { plan: 2 }, (done) => {

                const reporter = new GoodConsole();
                const out = new Streams.Writer();
                const reader = new Streams.Reader();

                reader.pipe(reporter).pipe(out);
                reader.push(internals.response);
                reader.push(null);
                reader.once('end', () => {

                    expect(out.data).to.have.length(1);
                    expect(out.data[0]).to.be.equal('160318/013330.957, (1458264811279:localhost:16014:ilx17kv4:10001) [response] http://localhost:61253: \u001b[1;33mpost\u001b[0m /data {"name":"adam"} \u001b[32m200\u001b[0m (responseSentTime: 100ms) (responseTime: 150ms)\n');
                    done();
                });
            });

            it('returns a formatted string for "response" events without a query', { plan: 2 }, (done) => {

                const reporter = new GoodConsole();
                const out = new Streams.Writer();
                const reader = new Streams.Reader();

                reader.pipe(reporter).pipe(out);

                const response = Object.assign({}, internals.response);
                delete response.query;

                reader.push(response);
                reader.push(null);
                reader.once('end', () => {

                    expect(out.data).to.have.length(1);
                    expect(out.data[0]).to.be.equal('160318/013330.957, (1458264811279:localhost:16014:ilx17kv4:10001) [response] http://localhost:61253: \u001b[1;33mpost\u001b[0m /data  \u001b[32m200\u001b[0m (responseSentTime: 100ms) (responseTime: 150ms)\n');
                    done();
                });
            });

            it('returns a formatted string for "response" events without a statusCode', { plan: 2 }, (done) => {

                const reporter = new GoodConsole();
                const out = new Streams.Writer();
                const reader = new Streams.Reader();

                reader.pipe(reporter).pipe(out);

                const response = Object.assign({}, internals.response);
                delete response.statusCode;

                reader.push(response);
                reader.push(null);

                reader.once('end', () => {

                    expect(out.data).to.have.length(1);
                    expect(out.data[0]).to.be.equal('160318/013330.957, (1458264811279:localhost:16014:ilx17kv4:10001) [response] http://localhost:61253: \u001b[1;33mpost\u001b[0m /data {"name":"adam"}  (responseSentTime: 100ms) (responseTime: 150ms)\n');
                    done();
                });
            });

            it('returns a formatted string for "response" events uncolored', { plan: 2 }, (done) => {

                const reporter = new GoodConsole({ color: false });
                const out = new Streams.Writer();
                const reader = new Streams.Reader();

                reader.pipe(reporter).pipe(out);

                reader.push(internals.response);
                reader.push(null);

                reader.once('end', () => {

                    expect(out.data).to.have.length(1);
                    expect(out.data[0]).to.be.equal('160318/013330.957, (1458264811279:localhost:16014:ilx17kv4:10001) [response] http://localhost:61253: post /data {"name":"adam"} 200 (responseSentTime: 100ms) (responseTime: 150ms)\n');
                    done();
                });
            });

            it('returns a formatted string for "response" events with local time', { plan: 2 }, (done) => {

                const reporter = new GoodConsole({ utc: false });
                const out = new Streams.Writer();
                const reader = new Streams.Reader();

                reader.pipe(reporter).pipe(out);

                const response = Object.assign({}, internals.response);
                response.timestamp = Date.now();

                const date = Moment(response.timestamp).format(internals.defaults.format);

                reader.push(response);
                reader.push(null);

                reader.once('end', () => {

                    expect(out.data).to.have.length(1);
                    expect(out.data[0]).to.be.equal(`${date}, (1458264811279:localhost:16014:ilx17kv4:10001) [response] http://localhost:61253: \u001b[1;33mpost\u001b[0m /data {"name":"adam"} \u001b[32m200\u001b[0m (responseSentTime: 100ms) (responseTime: 150ms)\n`);
                    done();
                });
            });

            it('returns a formatted string for "response" events with "head" as method', { plan: 2 }, (done) => {

                const reporter = new GoodConsole();
                const out = new Streams.Writer();
                const reader = new Streams.Reader();

                reader.pipe(reporter).pipe(out);

                const response = Object.assign({}, internals.response);
                response.method = 'head';

                reader.push(response);
                reader.push(null);

                reader.once('end', () => {

                    expect(out.data).to.have.length(1);
                    expect(out.data[0]).to.be.equal('160318/013330.957, (1458264811279:localhost:16014:ilx17kv4:10001) [response] http://localhost:61253: \u001b[1;34mhead\u001b[0m /data {"name":"adam"} \u001b[32m200\u001b[0m (responseSentTime: 100ms) (responseTime: 150ms)\n');
                    done();
                });
            });

            it('returns a formatted string for "response" events with "statusCode" 500', { plan: 2 }, (done) => {

                const reporter = new GoodConsole();
                const out = new Streams.Writer();
                const reader = new Streams.Reader();

                reader.pipe(reporter).pipe(out);

                const response = Object.assign({}, internals.response);
                response.statusCode = 599;

                reader.push(response);
                reader.push(null);

                reader.once('end', () => {

                    expect(out.data).to.have.length(1);
                    expect(out.data[0]).to.be.equal('160318/013330.957, (1458264811279:localhost:16014:ilx17kv4:10001) [response] http://localhost:61253: \u001b[1;33mpost\u001b[0m /data {"name":"adam"} \u001b[31m599\u001b[0m (responseSentTime: 100ms) (responseTime: 150ms)\n');
                    done();
                });
            });

            it('returns a formatted string for "response" events with "statusCode" 400', { plan: 2 }, (done) => {

                const reporter = new GoodConsole();
                const out = new Streams.Writer();
                const reader = new Streams.Reader();

                reader.pipe(reporter).pipe(out);

                const response = Object.assign({}, internals.response);
                response.statusCode = 418;

                reader.push(response);
                reader.push(null);

                reader.once('end', () => {

                    expect(out.data).to.have.length(1);
                    expect(out.data[0]).to.be.equal('160318/013330.957, (1458264811279:localhost:16014:ilx17kv4:10001) [response] http://localhost:61253: \u001b[1;33mpost\u001b[0m /data {"name":"adam"} \u001b[33m418\u001b[0m (responseSentTime: 100ms) (responseTime: 150ms)\n');
                    done();
                });
            });

            it('returns a formatted string for "response" events with "statusCode" 300', { plan: 2 }, (done) => {

                const reporter = new GoodConsole();
                const out = new Streams.Writer();
                const reader = new Streams.Reader();

                reader.pipe(reporter).pipe(out);

                const response = Object.assign({}, internals.response);
                response.statusCode = 304;

                reader.push(response);
                reader.push(null);

                reader.once('end', () => {

                    expect(out.data).to.have.length(1);
                    expect(out.data[0]).to.be.equal('160318/013330.957, (1458264811279:localhost:16014:ilx17kv4:10001) [response] http://localhost:61253: \u001b[1;33mpost\u001b[0m /data {"name":"adam"} \u001b[36m304\u001b[0m (responseSentTime: 100ms) (responseTime: 150ms)\n');
                    done();
                });
            });
        });

        describe('ops events', () => {

            it('returns a formatted string for "ops" events', { plan: 2 }, (done) => {

                const reporter = new GoodConsole();
                const out = new Streams.Writer();
                const reader = new Streams.Reader();

                reader.pipe(reporter).pipe(out);

                for (let i = 0; i < 20; ++i) {
                    reader.push(internals.ops);
                }
                reader.push(null);

                reader.once('end', () => {

                    expect(out.data).to.have.length(20);
                    expect(out.data[0]).to.be.equal('160318/013330.957, [ops] memory: 29Mb, uptime (seconds): 6, load: [1.650390625,1.6162109375,1.65234375]\n');
                    done();
                });
            });
        });

        describe('error events', () => {

            it('returns a formatted string for "error" events', { plan: 2 }, (done) => {

                const reporter = new GoodConsole();
                const out = new Streams.Writer();
                const reader = new Streams.Reader();

                reader.pipe(reporter).pipe(out);

                reader.push(internals.error);
                reader.push(null);

                reader.once('end', () => {

                    expect(out.data).to.have.length(1);
                    expect(out.data[0]).to.be.equal('160318/013330.957, (1419005623332:new-host.local:48767:i3vrb3z7:10000) [error,user,info] message: Just a simple error, stack: Error: Just a simple Error\n');
                    done();
                });
            });
        });

        describe('request events', () => {

            it('returns a formatted string for "request" events', { plan: 2 }, (done) => {

                const reporter = new GoodConsole();
                const out = new Streams.Writer();
                const reader = new Streams.Reader();

                reader.pipe(reporter).pipe(out);

                reader.push(internals.request);
                reader.push(null);

                reader.once('end', () => {

                    expect(out.data).to.have.length(1);
                    expect(out.data[0]).to.be.equal('160318/013330.957, (1419005623332:new-host.local:48767:i3vrb3z7:10000) [request,user,info] data: you made a request\n');
                    done();
                });
            });
        });

        describe('log and default events', () => {

            it('returns a formatted string for "log" and "default" events', { plan: 2 }, (done) => {

                const reporter = new GoodConsole();
                const out = new Streams.Writer();
                const reader = new Streams.Reader();

                reader.pipe(reporter).pipe(out);

                reader.push(internals.default);
                reader.push(null);

                reader.once('end', () => {

                    expect(out.data).to.have.length(1);
                    expect(out.data[0]).to.be.equal('160318/013330.957, [request,user,info] data: you made a default\n');
                    done();
                });
            });

            it('returns a formatted string for "default" events without data', { plan: 2 }, (done) => {

                const reporter = new GoodConsole();
                const out = new Streams.Writer();
                const reader = new Streams.Reader();

                reader.pipe(reporter).pipe(out);

                const noData = Object.assign({}, internals.default);
                delete noData.data;

                reader.push(noData);
                reader.push(null);

                reader.once('end', () => {

                    expect(out.data).to.have.length(1);
                    expect(out.data[0]).to.be.equal('160318/013330.957, [request,user,info] data: (none)\n');
                    done();
                });
            });

            it('returns a formatted string for "default" events with data as object', { plan: 2 }, (done) => {

                const reporter = new GoodConsole();
                const out = new Streams.Writer();
                const reader = new Streams.Reader();

                reader.pipe(reporter).pipe(out);

                const defaultEvent = Object.assign({}, internals.default);
                defaultEvent.data = { hello: 'world' };

                reader.push(defaultEvent);
                reader.push(null);

                reader.once('end', () => {

                    expect(out.data).to.have.length(1);
                    expect(out.data[0]).to.be.equal('160318/013330.957, [request,user,info] data: {"hello":"world"}\n');
                    done();
                });
            });

            it('returns a formatted string for "default" events with data as object', { plan: 2 }, (done) => {

                const reporter = new GoodConsole();
                const out = new Streams.Writer();
                const reader = new Streams.Reader();

                reader.pipe(reporter).pipe(out);

                const defaultEvent = Object.assign({}, internals.default);
                defaultEvent.tags = 'test';

                reader.push(defaultEvent);
                reader.push(null);

                reader.once('end', () => {

                    expect(out.data).to.have.length(1);
                    expect(out.data[0]).to.be.equal('160318/013330.957, [request,test] data: you made a default\n');
                    done();
                });
            });

            it('returns a formatted string for "default" events with data as Error', { plan: 2 }, (done) => {

                const reporter = new GoodConsole();
                const out = new Streams.Writer();
                const reader = new Streams.Reader();

                reader.pipe(reporter).pipe(out);

                const defaultEvent = Object.assign({}, internals.default);
                defaultEvent.data = new Error('you logged an error');

                reader.push(defaultEvent);
                reader.push(null);

                reader.once('end', () => {

                    expect(out.data).to.have.length(1);
                    expect(out.data[0].split('\n')[0]).to.be.equal('160318/013330.957, [request,user,info] message: you logged an error, stack: Error: you logged an error');
                    done();
                });
            });
        });
    });
});
