'use strict';

// Load modules

const Hoek = require('hoek');
const Utils = require('./utils');

// Declare internals

const internals = {};


module.exports = internals;


internals.delay = (callback) => {

    const bench = new Hoek.Bench();
    setImmediate(() => {

        return callback(null, bench.elapsed());
    });
};


internals.uptime = Utils.makeContinuation(process.uptime);


internals.memoryUsage = Utils.makeContinuation(process.memoryUsage);
