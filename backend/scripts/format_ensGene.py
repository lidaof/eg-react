# this script formats raw refgene data from UCSC so mongoimport can read it.

with open('ensGene.txt') as fin, open('ensGene_load', 'w') as fout:
    for line in fin:
        t = line.strip().split('\t')
        # the 2nd to last column is for gene type, or transcriptClass for gencode
        # "bin,name,chrom,strand,txStart,txEnd,cdsStart,cdsEnd,exonCount,exonStarts,exonEnds,score,name2,cdsStartStat,cdsEndStat,exonFrames",
        fout.write(
            '{0[2]}\t{0[4]}\t{0[5]}\t{0[6]}\t{0[7]}\t{0[3]}\t{0[12]}\t{0[1]}\t\t{0[9]}\t{0[10]}\t{1}\n'.format(t, ''))
