/**
 * Parses UCSC-style tab-separated cytoband data into JSON.  This is a node.js script that the client does run; we
 * only run it once to generate the JSON and git commit the result.
 * 
 * @author Silas Hsu
 */
'use strict';

const path = require('path');
const fs = require('fs');
const _ = require('lodash');

function promiseReadFile(readPath, encoding) {
    return new Promise((resolve, reject) => {
        fs.readFile(readPath, encoding, (error, data) => {
            if (error) {
                reject(error);
            } else {
                resolve(data);
            }
        });
    });
}

function promiseWriteFile(writePath, contents) {
    return new Promise((resolve, reject) => {
        fs.writeFile(writePath, contents, error => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}

const CYTOBAND_PROPS = ["chrom", "chromStart", "chromEnd", "name", "gieStain"];
function makeCytobandObject(rawStringValues) {
    if (rawStringValues.length !== CYTOBAND_PROPS.length) {
        return null;
    }
    const object = _.zipObject(CYTOBAND_PROPS, rawStringValues);
    object.chromStart = Number.parseInt(object.chromStart);
    object.chromEnd = Number.parseInt(object.chromEnd);
    if (!Number.isSafeInteger(object.chromStart) || !Number.isSafeInteger(object.chromEnd)) {
        return null;
    }
    return object;
}

/*
// Basic return structure
{
    "chr1": [
        {
            "chrom": "chr1",
            "chromStart": 0,
            "chromEnd", 2300000,
            "name": p36.33,
            "gieStain": gneg
        }
    ]
}
*/

/**
 * Parses raw text data into a data structure containing cytoband objects.  See comment above this in the source code
 * for what the object looks like
 * 
 * @param {string} text - raw tab-separated cytoband data
 * @return {CytobandBlob} - cytoband data in a data structure
 */
function convertTextToObject(text) {
    let result = {};
    const lines = text.split('\n');
    for (let line of lines) {
        const values = line.split('\t');
        const cytobandObject = makeCytobandObject(values);
        if (cytobandObject) {
            const chrom = cytobandObject.chrom;
            if (!result[chrom]) {
                result[chrom] = [];
            }
            result[chrom].push(cytobandObject);
        }
    }
    return result;
}

async function main(argv) {
    if (argv.length < 3) {
        console.log(`Usage: node ${argv[1]} [cytoband text file to convert to json file]`);
        return 1;
    }

    const inPath = argv[2];
    const inFileName = path.basename(inPath, '.txt');
    const inFilePath = path.dirname(inPath);
    const outPath = `${inFilePath}/${inFileName}.json`;
    try {
        const input = await promiseReadFile(inPath, 'utf8');
        const output = JSON.stringify(convertTextToObject(input));
        await promiseWriteFile(outPath, output);
        console.log(`${inPath} --> ${outPath}`);
    } catch (error) {
        console.error(error);
        return 2;
    }
    return 0;
}

if (require.main === module) { // Called directly
    main(process.argv).then(process.exit)
} // else required as a module
