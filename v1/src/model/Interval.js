class Interval {
    constructor(start, end) {
        this.start = start;
        this.end = end;
    }

    *[Symbol.iterator] () {
        yield this.start;
        yield this.end;
    }
}

export default Interval;
