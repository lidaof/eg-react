/**
 * !!! This is a node.js script that the client doesn't run !!!
 * 
 * Parses UCSC-style tab-separated cytoband data into JSON.  We only run it once to generate the JSON and git commit the
 * result.  See also: {@link CytobandTypes.ts}
 * 
 * @author Silas Hsu
 */
'use strict';

const path = require('path');
const fs = require('fs');
const _ = require('lodash');

const RECORD_DELIMITER = '\n';
const FIELD_DELIMITER = '\t';

/**
 * Reads the contents of a file asynchronously.  Promisfied version of fs.readFile.
 * 
 * @param {string} readPath - path to read
 * @param {string} [encoding] - encoding to read
 * @return {Promise<string | Buffer>} - Promise for contents of the file
 * @see https://nodejs.org/api/fs.html#fs_fs_readfile_path_options_callback
 */
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

/**
 * Writes to a file asynchronously, creating the file if it doesn't exist, and completely replacing the contents if it
 * already exists.  Promisfied version of fs.writeFile.
 * 
 * @param {string} writePath - path to write
 * @param {string} contents - what to write
 * @return {Promise<void>} - Promise the resolves when writing is done
 * @see https://nodejs.org/api/fs.html#fs_fs_writefile_file_data_options_callback
 */
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
/**
 * Constructs a Cytoband object from a string that contains the proper data.
 * 
 * @param {string[]} rawRecord - array of strings containing cytoband data
 * @return {Cytoband | null} - cytoband object, or null if there was a problem
 */
function makeCytobandObject(rawRecord) {
    const rawStringValues = rawRecord.split(FIELD_DELIMITER);
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

/**
 * Parses raw text data into a mapping from chromosome name to a list of all cytobands in that chromosome.
 * 
 * @param {string} text - raw UCSC cytoband file contents
 * @return {CytobandMap} - cytoband data map
 */
function convertTextToCytobandMap(text) {
    let result = {};
    const rawRecords = text.split(RECORD_DELIMITER);
    for (let rawRecord of rawRecords) {
        const cytobandObject = makeCytobandObject(rawRecord);
        if (cytobandObject) {
            const chrom = cytobandObject.chrom;
            if (!result[chrom]) {
                result[chrom] = [];
            }
            result[chrom].push(cytobandObject);
        } else {
            console.warn("Could not parse cytoband from data: " + rawRecord);
        }
    }
    return result;
}

/**
 * Main entry point.
 * 
 * @param {string[]} argv - arguments
 * @return {Promise<number>} exit code
 */
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
        const output = JSON.stringify(convertTextToCytobandMap(input));
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
