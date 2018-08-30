#!/usr/bin/python
# programmer : Daofeng
# usage:

import sys, gzip

def main():
    
    desc = {}
    with open('kgXref.txt') as fin:
        # "kgID,mRNA,spID,spDisplayID,geneSymbol,refseq,protAcc,description,rfamAcc,tRnaName",
        for line in fin:
            t = line.strip().split('\t')
            desc[t[4]] = t[7]
    d = {}
    with gzip.open('gencode.vM18.annotation.gtf.gz', 'rb') as fin:
        for line in fin:
            if line.startswith('#'): continue
            t = line.strip().split('\t')
            details = t[-1].split(';')
            dd = {}
            for detail in details:
                detail = detail.strip()
                if detail:
                    xid, xvalue = detail.split()
                    dd[xid] = xvalue.strip('"')
            geneid = dd['gene_id']
            genetype = dd['gene_type']
            start = t[3]
            end = t[4]
            chrom = t[0]
            strand = t[6]
            name = dd['gene_name']
            genedesc = ''
            if name in desc:
                genedesc = desc[name]
            if t[2] == 'gene':
                d[geneid] = [geneid, chrom, strand, start, end, 'na','na', [], [], name, genetype, genedesc]
            if t[2] == 'transcript':
                d[geneid][5] = start
                d[geneid][6] = end
            if t[2] == 'exon':
                d[geneid][7].append(start)
                d[geneid][8].append(end)
    for k in d:
        v = d[k]
        v[7] = '{},'.format(','.join(d[k][7]))
        v[8] = '{},'.format(','.join(d[k][8]))
        print '{}'.format('\t'.join(v))

if __name__=="__main__":
    main()


