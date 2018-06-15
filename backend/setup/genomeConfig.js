const GENE_FILEDS = 'id,chrom,strand,txStart,txEnd,cdsStart,cdsEnd,exonStarts,exonEnds,name,transcriptionClass,description';

const geneFieldsAndIndex = {
  fields:
    GENE_FILEDS,
  indexFields: [
    //first index field would also be used for gene name search field
    {
      id: 1,
      name: 1
    },
    {
      chrom: 1,
      txStart: 1,
      txEnd: 1
    }
  ]
};


const hg19 = [
  {
    name: "refGene",
    file: "refGene_load",
    fieldsConfig: geneFieldsAndIndex
  },
  {
    name: "gencodeV28",
    file: "gencodeV28_load",
    fieldsConfig: geneFieldsAndIndex
  }
];

const mm10 = [
  {
    name: "refGene",
    file: "refGene_load",
    fieldsConfig: geneFieldsAndIndex
  }
];

const danRer10 = [
  {
    name: "ncbiRefSeq",
    file: "ncbiRefSeq_load",
    fieldsConfig: geneFieldsAndIndex
  }
];

const genomeConfig = { hg19, mm10, danRer10 };

module.exports = genomeConfig;
