'use strict';

const Stream = require('stream');

class Writer extends Stream.Writable {
    constructor() {

        super({ objectMode: true });
        this.data = [];
    }
    _write(chunk, enc, callback) {

        this.data.push(chunk);
        callback(null);
    }
}

class Reader extends Stream.Readable {
    constructor() {

        super({ objectMode: true });
    }
    _read() {}
}

module.exports = { Writer, Reader };
