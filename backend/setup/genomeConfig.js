/**
 * Genome configurations.  By default, the import scripts will look for the genome data in a directory with the same
 * name as the genome name.  For example, since the hg19 config is named "hg19", the scripts will look for data in the
 * `hg19` directory.
 * 
 * @author Daofeng Li
 */

const GENE_FILEDS = // The mapping from column names to field names in the database
    'id,chrom,strand,txStart,txEnd,cdsStart,cdsEnd,exonStarts,exonEnds,name,transcriptionClass,description';

const geneFieldsAndIndex = {
    fields: GENE_FILEDS,
    indexFields: [
        { // Used for gene name search
            id: 1,
            name: 1
        },
        { // Used for gene locus search
            chrom: 1,
            txStart: 1,
            txEnd: 1
        }
    ]
};

const hg19 = [
    {
        name: 'refGene',
        file: 'refGene_load',
        fieldsConfig: geneFieldsAndIndex
    },
    {
        name: 'gencodeV28',
        file: 'gencodeV28_load',
        fieldsConfig: geneFieldsAndIndex
    }
];

const mm10 = [
    {
        name: 'refGene',
        file: 'refGene_load',
        fieldsConfig: geneFieldsAndIndex
    }
];

const danRer10 = [
    {
        name: 'ncbiRefSeq',
        file: 'ncbiRefSeq_load',
        fieldsConfig: geneFieldsAndIndex
    }
];

const genomeConfig = { hg19, mm10, danRer10 };

module.exports = genomeConfig;
