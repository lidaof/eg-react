export class GuaranteeMap<K, V> extends Map<K, V> {
    constructor(public initCallback: (key: K, ...args: any[]) => V) {
        super();
        this.initCallback = initCallback;
    }

    get(key: K, ...args: any[]): V {
        let value = super.get(key);
        if (!value) {
            value = this.initCallback(key, ...args);
            super.set(key, value);
        }
        return value;
    }
}
