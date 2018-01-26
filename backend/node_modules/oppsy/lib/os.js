'use strict';

// Load modules

const Os = require('os');
const Utils = require('./utils');


// Declare internals

const internals = {};


module.exports = internals;

internals.mem = Utils.makeContinuation(() => {

    return {
        total: Os.totalmem(),
        free: Os.freemem()
    };
});

internals.loadavg = Utils.makeContinuation(Os.loadavg);

internals.uptime = Utils.makeContinuation(Os.uptime);
