'use strict';

exports.makeContinuation = (predicate) => {

    return (callback) => {

        process.nextTick(callback, null, predicate());
    };
};
