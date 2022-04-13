# this script takes bed file from https://ftp.ncbi.nlm.nih.gov/refseq/MANE/MANE_human/ and formats it so mongoimport can read it
# hg38 only sa far
import json


desc = {}
with open('kgXref.txt') as fin:
    # "kgID,mRNA,spID,spDisplayID,geneSymbol,refseq,protAcc,description,rfamAcc,tRnaName",
    for line in fin:
        t = line.strip().split('\t')
        desc[t[0]] = t[7]

with open('MANE.GRCh38.v1.0.refseq.bed')  as fin, open('mane_select_v1.0.hg38.refbed','w') as fout:
    for line in fin:
        t = line.strip().split('\t')
        chrom = t[0]
        start = int(t[1])
        end = int(t[2])
        geneid = t[3]
        cstart = t[6]
        cend = t[7]
        symbol = t[18]
        gtype = t[19]
        if t[-4] in desc:
            description = desc[t[-4]]
        else:
            description = ''
        details = {}
        details['description'] = description
        details['NCBI id'] = t[3]
        details['NCBI gene'] = t[17]
        details['NCBI protein'] = t[-5]
        details['Ensembl id'] = t[-4]
        details['Ensembl gene'] = t[-3]
        details['Ensembl protein'] = t[-2]
        details['maneStat'] = t[-1]
        estarts = t[11].rstrip(',').split(',')
        estarts = [int(x) for x in estarts]
        esizes = t[10].rstrip(',').split(',')
        esizes = [int(x) for x in esizes]
        estarts = [x + start for x in estarts]
        eends = [ n+estarts[m] for m,n in enumerate(esizes)]
        estarts = [str(x) for x in estarts]
        eends = [str(x) for x in eends]
        fout.write('{}\t{}\t{}\t{}\t{}\t{}\t{}\t{}\t{}\t{}\t{}\t{}\n'.format(chrom, start, end, cstart, cend, t[5], symbol, t[3], gtype, ','.join(estarts), ','.join(eends), json.dumps(details)))
