/**
 * Genome configurations.  By default, the import scripts will look for the genome data in a directory with the same
 * name as the genome name.  For example, since the hg19 config is named "hg19", the scripts will look for data in the
 * `hg19` directory.
 * 
 * @author Daofeng Li
 */

const GENE_FILEDS = // The mapping from column names to field names in the database
    // 'id,chrom,strand,txStart,txEnd,cdsStart,cdsEnd,exonStarts,exonEnds,name,transcriptionClass,description';
    'chrom,txStart,txEnd,cdsStart,cdsEnd,strand,name,id,transcriptionClass,exonStarts,exonEnds,description';

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
        file: 'HG19_RefSeq_Gene.bed',
        fieldsConfig: geneFieldsAndIndex
    },
    {
        name: 'gencodeV29',
        file: 'gencode.v29lift37.hg19.annotation_Gene.bed',
        fieldsConfig: geneFieldsAndIndex
    },
    {
        name: 'gencodeV29Basic',
        file: 'gencode.v29lift37.hg19.basic.annotation_Gene.bed',
        fieldsConfig: geneFieldsAndIndex
    }
];

const hg38 = [
    {
        name: 'refGene',
        file: 'HG38_RefSeq_Gene.bed',
        fieldsConfig: geneFieldsAndIndex
    },
    {
        name: 'gencodeV29',
        file: 'gencode.v29.hg38.annotation_Gene.bed',
        fieldsConfig: geneFieldsAndIndex
    },
    {
        name: 'gencodeV29Basic',
        file: 'gencode.v29.hg38.basic.annotation_Gene.bed',
        fieldsConfig: geneFieldsAndIndex
    },
    {
        name: 'Ensembl_GRCh38_94',
        file: 'Homo_sapiens.GRCh38.94.chr_Gene.bed',
        fieldsConfig: geneFieldsAndIndex
    },
];

const panTro5 = [
    {
        name: 'refGene',
        file: 'panTro5_Gene.bed',
        fieldsConfig: geneFieldsAndIndex
    }
];

const mm10 = [
    {
        name: 'refGene',
        file: 'MM10_RefSeq_Gene.bed',
        fieldsConfig: geneFieldsAndIndex
    },
    {
        name: 'gencodeM19',
        file: 'gencode.vM19.annotation_Gene.bed',
        fieldsConfig: geneFieldsAndIndex
    },
    {
        name: 'gencodeM19Basic',
        file: 'gencode.vM19.basic.annotation_Gene.bed',
        fieldsConfig: geneFieldsAndIndex
    }
];

const danRer10 = [
    {
        name: 'refGene',
        file: 'DANRER10_RefSeq_Gene.bed',
        fieldsConfig: geneFieldsAndIndex
    },
    {
        name: 'Ensembl_GRCz10_91',
        file: 'Danio_rerio.GRCz10.91.chr_Gene.bed',
        fieldsConfig: geneFieldsAndIndex
    },
];

const danRer11 = [
    {
        name: 'refGene',
        file: 'ncbiRefSeq_load',
        fieldsConfig: geneFieldsAndIndex
    }
];

const rn6 = [
    {
        name: 'refGene',
        file: 'rn6_Gene.bed',
        fieldsConfig: geneFieldsAndIndex
    }
];

const mm9 = [
    {
        name: 'refGene',
        file: 'refGene_load',
        fieldsConfig: geneFieldsAndIndex
    }
];

const bosTau8 = [
    {
        name: 'refGene',
        file: 'refGene_load',
        fieldsConfig: geneFieldsAndIndex
    }
];

const rheMac8 = [
    {
        name: 'refGene',
        file: 'refGene_load',
        fieldsConfig: geneFieldsAndIndex
    }
];

const araTha1 = [
    {
        name: 'gene',
        file: 'tair10Gene_load',
        fieldsConfig: geneFieldsAndIndex
    }
];

const galGal5 = [
    {
        name: 'refGene',
        file: 'refGene_load',
        fieldsConfig: geneFieldsAndIndex
    }
];
const galGal6 = [
    {
        name: 'refGene',
        file: 'refGene_load',
        fieldsConfig: geneFieldsAndIndex
    }
];

const genomeConfig = { hg19, mm10, danRer10, danRer11, hg38, panTro5, rn6, mm9, bosTau8, araTha1, rheMac8, galGal5, galGal6 };

module.exports = genomeConfig;
