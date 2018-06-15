desc = {}
with open('kgXref.txt') as fin:
    # "kgID,mRNA,spID,spDisplayID,geneSymbol,refseq,protAcc,description,rfamAcc,tRnaName",
    for line in fin:
        t = line.strip().split('\t')
        desc[t[5]] = t[7]
with open('refGene.txt')  as fin, open('refGene_load','w') as fout:
    for line in fin:
        t = line.strip().split('\t')
        if t[1] in desc:
            description = desc[t[1]]
        else:
            description = ''
        # the 2nd to last column is for gene type, or transcriptClass for gencode
        # "bin,name,chrom,strand,txStart,txEnd,cdsStart,cdsEnd,exonCount,exonStarts,exonEnds,score,name2,cdsStartStat,cdsEndStat,exonFrames",
        fout.write('{0[1]}\t{0[2]}\t{0[3]}\t{0[4]}\t{0[5]}\t{0[6]}\t{0[7]}\t{0[9]}\t{0[10]}\t{0[12]}\t{1}\t{2}\n'.format(t, '', description))