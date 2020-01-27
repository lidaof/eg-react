# this script formats sgdGene data from UCSC for yeast so mongoimport can read it.

descs = {}
names = {}
with open('sgdDescription.txt') as fin:
    for line in fin:
        t = line.strip().split('\t')
        descs[t[0]] = t[2]
with open('sgdToName.txt') as fin:
    for line in fin:
        t = line.strip().split('\t')
        names[t[0]] = t[1]
with open('sgdGene.txt') as fin, open('sgdGene_load', 'w') as fout:
    for line in fin:
        t = line.strip().split('\t')
        if t[1] in descs:
            description = descs[t[1]]
        else:
            description = ''
        if t[1] in names:
            symbol = names[t[1]]
        else:
            symbol = ''
        # the 2nd to last column is for gene type, or transcriptClass for gencode
        # "bin,name,chrom,strand,txStart,txEnd,cdsStart,cdsEnd,exonCount,exonStarts,exonEnds,score,name2,cdsStartStat,cdsEndStat,exonFrames",
        fout.write('{0[2]}\t{0[4]}\t{0[5]}\t{0[6]}\t{0[7]}\t{0[3]}\t{1}\t{0[1]}\t\t{0[9]}\t{0[10]}\t{2}\n'.format(
            t, symbol, description))
