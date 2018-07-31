# this script formats raw ncbi refseq data so mongoimport can read it.

desc = {}
with open('ncbiRefSeqLink.txt') as fin:
    # "id,status,name,product,mrnaAcc,protAcc,locusLinkId,omimId,hgnc,genbank,pseudo,gbkey,source,gene_biotype,gene_synonym,ncrna_class,note,description,externalId",
    for line in fin:
        t = line.strip().split('\t')
        desc[t[0]] = t[3]
with open('ncbiRefSeq.txt')  as fin, open('ncbiRefSeq_load','w') as fout:
    for line in fin:
        t = line.strip().split('\t')
        if t[1] in desc:
            description = desc[t[1]]
        else:
            description = ''
        # "bin,name,chrom,strand,txStart,txEnd,cdsStart,cdsEnd,exonCount,exonStarts,exonEnds,score,name2,cdsStartStat,cdsEndStat,exonFrames",
        fout.write('{0[1]}\t{0[2]}\t{0[3]}\t{0[4]}\t{0[5]}\t{0[6]}\t{0[7]}\t{0[9]}\t{0[10]}\t{0[12]}\t{1}\t{2}\n'.format(t, '', description))
