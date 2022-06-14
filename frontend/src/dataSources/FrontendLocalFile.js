import { promisify } from 'es6-promisify';
const fs = window.fs;
const fsOpen = fs && promisify(fs.open);
const fsRead = fs && promisify(fs.read);
const fsFStat = fs && promisify(fs.fstat);
const fsReadFile = fs && promisify(fs.readFile);
const fsClose = fs && promisify(fs.close);
export default class FrontendLocalFile {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    constructor(source, opts = {}) {
        console.log(source);
        this.filename = source;
    }
    getFd() {
        if (!this.fd) {
            this.fd = fsOpen(this.filename, 'r');
        }
        return this.fd;
    }
    async read(buffer, offset = 0, length, position = 0) {
        const fetchLength = Math.min(buffer.length - offset, length);
        const ret = await fsRead(await this.getFd(), buffer, offset, fetchLength, position);
        return { bytesRead: ret, buffer };
    }
    async readFile(options) {
        return fsReadFile(this.filename, options);
    }
    // todo memoize
    async stat() {
        return fsFStat(await this.getFd());
    }
    async close() {
        return fsClose(await this.getFd());
    }
}
