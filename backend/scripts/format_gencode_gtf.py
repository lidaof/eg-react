#!/usr/bin/python
# programmer : Daofeng
# usage:

import sys, gzip

#from https://github.com/ucscGenomeBrowser/kent/blob/022eb4f62a0af16526ca1bebcd9e68bd456265dc/src/hg/lib/gtexGeneBed.c
typeMap = {
    'IG_C_gene':'coding',
    'IG_D_gene':'coding',
    'IG_J_gene':'coding',
    'IG_V_gene':'coding',
    'TR_C_gene':'coding',
    'TR_D_gene':'coding',
    'TR_J_gene':'coding',
    'TR_V_gene': 'coding', 
    'IG_LV_gene': 'coding', 
    'polymorphic_pseudogene':'coding',
    'protein_coding': 'coding',

    'IG_C_pseudogene':'pseudo',
    'IG_J_pseudogene':'pseudo',
    'IG_V_pseudogene':'pseudo',
    'TR_J_pseudogene':'pseudo',
    'TR_V_pseudogene':'pseudo',
    'pseudogene':'pseudo',
    'transcribed_processed_pseudogene':'pseudo',
    'transcribed_unitary_pseudogene':'pseudo',
    'transcribed_unprocessed_pseudogene':'pseudo',
    'unitary_pseudogene':'pseudo',
    'unprocessed_pseudogene':'pseudo',
    'processed_pseudogene':'pseudo',
    'IG_pseudogene':'pseudo',
    'IG_D_pseudogene':'pseudo',


    '3prime_overlapping_ncrna':'nonCoding',
    'Mt_rRNA':'nonCoding',
    'Mt_tRNA':'nonCoding',
    'antisense':'nonCoding',
    'lincRNA':'nonCoding',
    'miRNA':'nonCoding',
    'misc_RNA':'nonCoding',
    'processed_transcript':'nonCoding',
    'rRNA':'nonCoding',
    'sense_intronic':'nonCoding',
    'sense_overlapping':'nonCoding',
    'snRNA':'nonCoding',
    'snoRNA':'nonCoding',
    '3prime_overlapping_ncRNA':'nonCoding',
    'bidirectional_promoter_lncRNA':'nonCoding',
    'macro_lncRNA':'nonCoding',
    'ribozyme':'nonCoding',
    'sRNA':'nonCoding',
    'scRNA':'nonCoding',
    'scaRNA':'nonCoding',

}


def main():
    
    desc = {}
    with open('kgXref.txt') as fin:
        # "kgID,mRNA,spID,spDisplayID,geneSymbol,refseq,protAcc,description,rfamAcc,tRnaName",
        for line in fin:
            t = line.strip().split('\t')
            desc[t[4]] = t[7]
    d = {}
    #with gzip.open('gencode.vM18.annotation.gtf.gz', 'rb') as fin:
    with open('gencode.vM18.annotation.gtf', 'rU') as fin:
        for line in fin:
            if line.startswith('#'): continue
            t = line.strip().split('\t')
            if t[1] == 'HAVANA': continue # skip havana annotation
            details = t[-1].split(';')
            dd = {}
            for detail in details:
                detail = detail.strip()
                if detail:
                    xid, xvalue = detail.split()
                    dd[xid] = xvalue.strip('"')
            geneid = dd['gene_id']
            genetype = dd['gene_type']
            gtype = genetype
            if genetype in typeMap:
                gtype = typeMap[genetype]
            start = t[3]
            end = t[4]
            chrom = t[0]
            strand = t[6]
            name = dd['gene_name']
            genedesc = ''
            if name in desc:
                genedesc = desc[name]
            if t[2] == 'transcript':
                d[geneid] = [geneid, chrom, strand, start, end, 'na','na', [], [], name, gtype, genedesc]
            if t[2] == 'transcript':
                d[geneid][5] = start
                d[geneid][6] = end
            if t[2] == 'exon':
                if start not in d[geneid][7]:
                    d[geneid][7].append(start)
                    if end not in d[geneid][8]:
                        d[geneid][8].append(end)
    for k in d:
        v = d[k]
        v[7] = '{},'.format(','.join(d[k][7]))
        v[8] = '{},'.format(','.join(d[k][8]))
        print '{}'.format('\t'.join(v))

if __name__=="__main__":
    main()


