import sys

gtffile= sys.argv[1]

# gff/gtf is 1-based

# load up gene structure
gene = {}
# key: mRNA name like Cre01.g000017.t1.1 but not gene name
# val: [chr, strand, txstart, txstop, cdsstart, cdsstop, [exon starts], [exon stops], desc=lst[8],symbol of gene id ]

thismrna = ''
with open(gtffile) as fin:
    for line in fin:
        if line.startswith('#'):
            continue
        lst = line.strip().split('\t')
        #gene_id "mito_gene-trnM(atg)"; transcript_id "mito_rna-trnM(atg)"; gene_name "mito_trnM(atg)";
        s = int(lst[3]) - 1
        e = int(lst[4]) - 1
        t = lst[8].split(';')
        thismrna = t[1].strip().split()[1].strip('"')
        geneid = t[0].strip().split()[1].strip('"')
        if lst[2] == 'transcript':
            if thismrna not in gene:    
                gene[thismrna] = [lst[0], lst[6], s, e, s, e, [], [], lst[8], geneid]
            else:
                 gene[thismrna][2] = s
                 gene[thismrna][3] = e
                 gene[thismrna][4] = s
                 gene[thismrna][5] = e
                 gene[thismrna][8] = lst[8]
        elif lst[2] == 'exon': # exon includes utr?
            if thismrna in gene:
                gene[thismrna][6].append(str(s))
                gene[thismrna][7].append(str(e))
            else:
                gene[thismrna] = [lst[0], lst[6], s, e, s, e, [str(s)], [str(e)], lst[8], geneid]


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
