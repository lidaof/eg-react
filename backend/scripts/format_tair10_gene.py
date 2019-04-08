import sys

if len(sys.argv) != 4:
    print 'Usage: {0} <TAIR10_GFF3_genes.gff> <gene_aliases.date.txt> <TAIR10_functional_descriptions>'.format(sys.argv[0])
    sys.exit()

gff3file, aliasfile, funcfile = sys.argv[1:]

# load up gene structure
gene = {}
# key: mrna name like AT1G11111.1 but not gene name
# val: [chr, strand, txstart, txstop, cdsstart, cdsstop, [exon starts], [exon stops] ]

thismrna = ''
with open(gff3file) as fin:
    for line in fin:
        lst = line.split('\t')
        if lst[2] == 'mRNA':
            thismrna = lst[8].split(';')[0].split('=')[1]
            gene[thismrna] = [lst[0].lower(), lst[6], lst[3], lst[4], None, None, [], []]
        elif lst[2] == 'protein':
            gene[thismrna][4] = lst[3]
            gene[thismrna][5] = lst[4]
        elif lst[2] == 'CDS':
            gene[thismrna][6].append(lst[3])
            gene[thismrna][7].append(lst[4])




# load name - symbol - desc
desc = {}
with open(funcfile) as fin:
    for line in fin:
        lst = line.rstrip().split('\t')
        if len(lst) > 2:
            n = lst[0].split('.')[0]
            desc[n] = [n,lst[2]]

# fill in alias
with open(aliasfile) as fin:
    for line in fin:
        lst = line.rstrip().split('\t')
        if lst[0] in desc:
            desc[lst[0]][0] = lst[1]
        else:
            desc[lst[0]] = [lst[1], lst[2] if len(lst)>2 else 'No description']



# write that into gene structure table similar as ucsc's
fout = open('tair10Gene_load','w')
for g in gene:
    # name, chrom, strand, txstart, txend, cdsstart, cdsend, exoncount, exonstarts, exonstops, 0, name2
    symbol = g.split('.')[0]
    if symbol in desc:
        description = desc[symbol][1]
        symbol2 = desc[symbol][0]
    else:
        description = ''
        symbol2 = symbol
    fout.write('{0}\t{1}\t{2}\t{3}\t{4}\t{5}\t{6}\t{7}\t{8}\t{9}\t{10}\t{11}\n'.format(
        gene[g][0], gene[g][2], gene[g][3], gene[g][4], gene[g][5], gene[g][1], symbol2, g, '', 
        ','.join(gene[g][6]),
        ','.join(gene[g][7]),
        description
        ))
fout.close()
