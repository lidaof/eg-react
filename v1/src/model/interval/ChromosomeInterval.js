import OpenInterval from './OpenInterval';

class ChromosomeInterval extends OpenInterval {
    static parse(string) {
        const regexMatch = string.match(/([\w:]+):(\d+)-(\d+)/);
        // eslint-disable-next-line no-cond-assign
        if (regexMatch) {
            const chr = regexMatch[1];
            const start = Number.parseInt(regexMatch[2], 10);
            const end = Number.parseInt(regexMatch[3], 10);
            return new ChromosomeInterval(chr, start, end);
        } else {
            return null;
        }
    }

    /**
     * 
     * @param {string} chr 
     * @param {number} start 
     * @param {number} end 
     */
    constructor(chr, start, end) {
        super(start, end);
        this.chr = chr;
    }

    /**
     * 
     * @param {ChromosomeInterval} other 
     */
    getOverlap(other) {
        if (this.chr !== other.chr) {
            return null;
        }
        const intersectionStart = Math.max(this.start, other.start);
        const intersectionEnd = Math.min(this.end, other.end);
        if (intersectionStart < intersectionEnd) {
            return new ChromosomeInterval(this.chr, intersectionStart, intersectionEnd);
        }

        return null;
    }

    toString() {
        return `${this.chr}:${this.start}-${this.end}`;
    }

    /**
     * 
     * @param {Feature} other - the "end" of the multi-chromosome interval
     * @return {string} a human-readable representation of a multi-feature interval
     */
    toStringWithOther(other) {
        return `${this.chr}:${this.start}-${other.chr}:${other.end}`;
    }
}

export default ChromosomeInterval;
