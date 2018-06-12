/**
 * Simple container for chromosome info.
 * 
 * @author Silas Hsu
 */
export class Chromosome {
    private _name: string;
    private _length: number;
    /**
     * Makes a new instance with specified name and length in bases.
     * 
     * @param {string} name - name of the chromosome
     * @param {number} length - length of the chromosome in bases
     */
    constructor(name: string, length: number) {
        this._name = name;
        this._length = length; 
    }

    /**
     * @return {string} this chromosome's name
     */
    getName(): string {
        return this._name;
    }

    /**
     * @return {number} this chromosome's length in bases
     */
    getLength(): number {
        return this._length;
    }
}