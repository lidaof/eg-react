'use strict';

const child_process = require('child_process');

/**
 * An importer of data for MongoDB
 */
class /*(interface)*/ MongoImporter {
    /**
     * Imports data into MongoDB.  The method will receive the data directory, database name to use, and a database
     * object from MongoDB.
     * 
     * @param {string} dataDir - data directory
     * @param {string} genomeName - database name to use
     * @param {Database} database - database object from MongoDB
     * @return {Promise<void>} promise that resolves when importing is done
     */
    async import(dataDir, genomeName, database) {

    }
}

const RefGeneImporter = {
    collectionName: 'refGene',
    import: async (dataDir, genomeName, database) => {
        child_process.execSync(`mongoimport -d ${genomeName} -c ${RefGeneImporter.collectionName} --drop ` +
            `--file ${dataDir}/${genomeName}/refGene.txt --type tsv ` +
            "-f bin,name,chrom,strand,txStart,txEnd,cdsStart,cdsEnd,exonCount,exonStarts,exonEnds,score,name2,cdsStartStat,cdsEndStat,exonFrames " +
            "--numInsertionWorkers 4"
        );
        const collection = database.collection(RefGeneImporter.collectionName);
        await collection.createIndex({name2: 1});
        await collection.createIndex({chrom: 1, txStart: 1, txEnd:1});
    },
}

const GeneDescriptionImporter = {
    collectionName: 'kgXref',
    import: async (dataDir, genomeName, database) => {
        child_process.execSync(`mongoimport -d ${genomeName} -c ${GeneDescriptionImporter.collectionName} --drop ` +
            `--file ${dataDir}/${genomeName}/kgXref.txt --type tsv ` +
            "-f kgID,mRNA,spID,spDisplayID,geneSymbol,refseq,protAcc,description,rfamAcc,tRnaName"
        );
        const collection = database.collection(GeneDescriptionImporter.collectionName);
        await collection.createIndex({refseq:1});
    }
}

const ALL_IMPORTERS = [
    RefGeneImporter,
    GeneDescriptionImporter,
];

module.exports = ALL_IMPORTERS;
