'use strict';

const JSON5 = require('json5');

const ColumnEnum = {
    CHROMOSOME: 0,
    START: 1,
    END: 2,
    DETAILS: 3,
    length: 4,
};
const REQUIRED_DETAIL_FIELDS = ["name", "id", "strand", "struct", "name2"];

class ParseError extends Error {
    constructor(reason, lineNumber = "?") {
        super(`at line ${lineNumber}: ${reason}`);
        this.name = 'ParseError';
    }
}

class RefGeneParser {
    parse(fileContents) {
        let lines = fileContents.split('\n');
        let parsedContent = [];
        let lineNumber = 1;
        for (let line of lines) {
            if (line.length === 0) {
                continue;
            }
            parsedContent.push(this._parseLine(line, lineNumber));
            lineNumber++;
        }

        return parsedContent;
    }

    _parseLine(line, lineNumber) {
        let columns = line.split('\t');
        if (columns.length != ColumnEnum.length) {
            throw new ParseError(
                `Expected ${ColumnEnum.length} tab-separated columns but got ${columns.length}`, lineNumber
            );
        }

        let rawJson = null;
        try {
            rawJson = JSON5.parse('{' + columns[ColumnEnum.DETAILS] + '}');
        } catch (error) {
            if (error instanceof SyntaxError) {
                throw new ParseError(`Could not parse JSON-like data: ${error.message}`, lineNumber);
            } else {
                throw error;
            }
        }

        let result = {
            chromosome: columns[ColumnEnum.CHROMOSOME],
            start: this._parseBaseNumber(columns[ColumnEnum.START]),
            end: this._parseBaseNumber(columns[ColumnEnum.END])
        };
        Object.assign(result, this._restructureDetails(rawJson, lineNumber));

        return result;
    }

    _parseBaseNumber(toParse, lineNumber) {
        let baseNumber = parseInt(toParse, 10);
        if (Number.isNaN(baseNumber) || baseNumber < 0) {
            throw new ParseError(`Invalid base number ${toParse}`, lineNumber);
        }
        return baseNumber;
    }

    _restructureDetails(details, lineNumber) {
        for (let propName of REQUIRED_DETAIL_FIELDS) {
            if (details[propName] === undefined) {
                throw new ParseError(`Expected data to contain field ${propName} but it was missing`, lineNumber);
            }
        }

        let exons = null;
        if (details.struct.thin) {
            exons = details.struct.thin;
        } else if (details.struct.thick) {
            exons = details.struct.thick;
        } else {
            throw new ParseError("Expected 'struct' to contain either 'thin' or 'thick' fields", lineNumber);
        }

        return {
            accession: details.name,
            id: details.id,
            strand: details.strand,
            exons: exons,
            description: details.desc || "",
            name: details.name2,
        }
    }
}

module.exports = {
    RefGeneParser: RefGeneParser,
    ParseError: ParseError
}
