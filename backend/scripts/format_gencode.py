# this script takes the file output by add_transcriptClass.py and formats it so mongoimport can read it

desc = {}
with open('kgXref.txt') as fin:
    # "kgID,mRNA,spID,spDisplayID,geneSymbol,refseq,protAcc,description,rfamAcc,tRnaName",
    for line in fin:
        t = line.strip().split('\t')
        desc[t[4]] = t[7]
with open('wgEncodeGencodeCompV39.with_transcriptClass.txt')  as fin, open('gencodeV39_load','w') as fout:
    for line in fin:
        t = line.strip().split('\t')
        if t[12] in desc:
            description = desc[t[12]]
        else:
            description = ''
        # "bin,name,chrom,strand,txStart,txEnd,cdsStart,cdsEnd,exonCount,exonStarts,exonEnds,score,name2,cdsStartStat,cdsEndStat,exonFrames,transcriptClass",
        fout.write('{0[1]}\t{0[2]}\t{0[3]}\t{0[4]}\t{0[5]}\t{0[6]}\t{0[7]}\t{0[9]}\t{0[10]}\t{0[12]}\t{0[16]}\t{1}\n'.format(t, description))
