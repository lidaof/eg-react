# this script takes the file output by add_transcriptClass.py and formats it so mongoimport can read it

desc = {}
with open('kgXref.txt') as fin:
    # "kgID,mRNA,spID,spDisplayID,geneSymbol,refseq,protAcc,description,rfamAcc,tRnaName",
    for line in fin:
        t = line.strip().split('\t')
        desc[t[4]] = t[7]
types = {}
with open('gencodeV35.meta.tsv') as fin:
    next(fin)
    for line in fin:
        t= line.strip('\n').split('\t') # same row not protein id at end of line
        geneid = t[4] # use transcript id
        symbol = t[1]
        gtype = t[-2]
        if geneid not in types:
            types[geneid] = [symbol, gtype]
with open('gencodeV35.bed')  as fin, open('chmv2_gencodeV35.refbed','w') as fout:
    for line in fin:
        t = line.strip().split('\t')
        chrom = t[0]
        start = int(t[1])
        end = int(t[2])
        geneid = t[3]
        cend = t[7]
        if cend == t[6]:
            cend = end
        symbol, gtype = types[geneid]
        if symbol in desc:
            description = desc[symbol]
        else:
            description = ''
        estarts = t[-1].rstrip(',').split(',')
        estarts = [int(x) for x in estarts]
        esizes = t[-2].rstrip(',').split(',')
        esizes = [int(x) for x in esizes]
        estarts = [x + start for x in estarts]
        eends = [ n+estarts[m] for m,n in enumerate(esizes)]
        estarts = [str(x) for x in estarts]
        eends = [str(x) for x in eends]
        fout.write('{}\t{}\t{}\t{}\t{}\t{}\t{}\t{}\t{}\t{}\t{}\t{}\n'.format(chrom, start, end, t[6], cend, t[5], symbol, t[3], gtype, ','.join(estarts), ','.join(eends), description))
