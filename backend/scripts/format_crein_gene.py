import sys

if len(sys.argv) != 4:
    print('Usage: {0} <Creinhardtii_281_v5.6.gene_exons.gff3> <Creinhardtii_281_v5.6.geneName.txt> <Creinhardtii_281_v5.6.description.txt>').format(
        sys.argv[0])
    sys.exit()

gff3file, aliasfile, funcfile = sys.argv[1:]

# load up gene structure
gene = {}
# key: mRNA name like Cre01.g000017.t1.1 but not gene name
# val: [chr, strand, txstart, txstop, cdsstart, cdsstop, [exon starts], [exon stops] ]

thismrna = ''
with open(gff3file) as fin:
    for line in fin:
        if line.startswith('#'):
            continue
        if line.startswith('scaffold'):
            continue
        lst = line.split('\t')
        if lst[2] == 'mRNA':
            thismrna = lst[8].split(';')[0].split('=')[1].replace('.v5.5', '')
            gene[thismrna] = [lst[0].replace('chromosome_', 'chr').replace(
                'scaffold_', 'scaf'), lst[6], lst[3], lst[4], lst[3], lst[4], [], []]
        elif lst[2] == 'five_prime_UTR':
            if lst[6] == '+':
                gene[thismrna][4] = lst[4]
            else:
                gene[thismrna][5] = lst[3]
        elif lst[2] == 'three_prime_UTR':
            if lst[6] == '+':
                gene[thismrna][5] = lst[3]
            else:
                gene[thismrna][4] = lst[4]
        elif lst[2] == 'exon':
            gene[thismrna][6].append(lst[3])
            gene[thismrna][7].append(lst[4])


# load desc
desc = {}
with open(funcfile) as fin:
    for line in fin:
        lst = line.rstrip().split('\t')
        if len(lst) > 1:
            # n = lst[0].split('.')[0]
            desc[lst[0]] = lst[1]

# load symbols
symbols = {}
with open(aliasfile) as fin:
    for line in fin:
        lst = line.rstrip().split('\t')
        if len(lst) > 1:
            # n = lst[0].split('.')[0]
            symbols[lst[0]] = lst[1]


# write that into gene structure table similar as ucsc's
fout = open('Creinhardtii5.6_load', 'w')
for g in gene:
    # name, chrom, strand, txstart, txend, cdsstart, cdsend, exoncount, exonstarts, exonstops, 0, name2
    if g in desc:
        description = desc[g]
    else:
        description = ''
    if g in symbols:
        sym = symbols[g]
    else:
        sym = g
    fout.write('{0}\t{1}\t{2}\t{3}\t{4}\t{5}\t{6}\t{7}\t{8}\t{9}\t{10}\t{11}\n'.format(
        gene[g][0], gene[g][2], gene[g][3], gene[g][4], gene[g][5], gene[g][1], sym, g, '',
        ','.join(gene[g][6]),
        ','.join(gene[g][7]),
        description
    ))
fout.close()

# run with python /Users/dli/eg-react/backend/scripts/format_crein_gene.py ~/Downloads/eg-react_raw_genomeData/Creinhardtii5.6/Creinhardtii_281_v5.6.gene_exons.gff3 ~/Downloads/eg-react_raw_genomeData/Creinhardtii5.6/Creinhardtii_281_v5.6.geneName.txt ~/Downloads/eg-react_raw_genomeData/Creinhardtii5.6/Creinhardtii_281_v5.6.description.txt
