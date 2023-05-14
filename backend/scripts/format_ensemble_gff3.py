import sys

gff3file= sys.argv[1]

# gff/gtf is 1-based

# load up gene structure
gene = {}
# key: mRNA name like Cre01.g000017.t1.1 but not gene name
# val: [chr, strand, txstart, txstop, cdsstart, cdsstop, [exon starts], [exon stops], desc=lst[8],symbol of gene id ]

thismrna = ''
with open(gff3file) as fin:
    for line in fin:
        if line.startswith('#'):
            continue
        lst = line.strip().split('\t')
        #ID=transcript:ENSGALT00010012895;Parent=gene:ENSGALG00010005419;biotype=protein_coding;transcript_id=ENSGALT00010012895;version=1
        s = int(lst[3]) - 1
        e = int(lst[4]) - 1
        if lst[2] == 'mRNA':    
            t = lst[8].split(';')
            thismrna = t[0].split('=')[1].split(':')[1]
            geneid = t[1].split('=')[1].split(':')[1]
            gene[thismrna] = [lst[0], lst[6], s, e, s, e, [], [], lst[8], geneid]
        elif lst[2] == 'five_prime_UTR':
            if lst[6] == '+':
                gene[thismrna][4] = e
            else:
                gene[thismrna][5] = s
        elif lst[2] == 'three_prime_UTR':
            if lst[6] == '+':
                gene[thismrna][5] = s
            else:
                gene[thismrna][4] = e
        elif lst[2] == 'CDS': # exon includes utr?
            gene[thismrna][6].append(str(s))
            gene[thismrna][7].append(str(e))


# write that into gene structure table similar as ucsc's
fout = open(sys.argv[2],'w')
for g in gene:
    # name, chrom, strand, txstart, txend, cdsstart, cdsend, exoncount, exonstarts, exonstops, 0, name2
    fout.write('{0}\t{1}\t{2}\t{3}\t{4}\t{5}\t{6}\t{7}\t{8}\t{9}\t{10}\t{11}\n'.format(
        gene[g][0], gene[g][2], gene[g][3], gene[g][4], gene[g][5], gene[g][1], gene[g][-1], g, 'coding', 
        ','.join(gene[g][6]),
        ','.join(gene[g][7]),
        gene[g][-2]
        ))
fout.close()
