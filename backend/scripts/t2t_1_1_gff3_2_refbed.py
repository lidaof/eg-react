#!/usr/bin/python
# programmer : Daofeng
# usage:

# convert ncbi gff3 to refbed for browser

import sys,gzip
typeMap = {
    'IG_C_gene':'coding',
    'IG_D_gene':'coding',
    'IG_J_gene':'coding',
    'IG_V_gene':'coding',
    'TR_C_gene':'coding',
    'TR_D_gene':'coding',
    'TR_J_gene':'coding',
    'TR_V_gene': 'coding', 
    'IG_LV_gene': 'coding', 
    'polymorphic_pseudogene':'coding',
    'protein_coding': 'coding',
    'IG_C_pseudogene':'pseudo',
    'IG_J_pseudogene':'pseudo',
    'IG_V_pseudogene':'pseudo',
    'TR_J_pseudogene':'pseudo',
    'TR_V_pseudogene':'pseudo',
    'pseudogene':'pseudo',
    'transcribed_processed_pseudogene':'pseudo',
    'transcribed_unitary_pseudogene':'pseudo',
    'transcribed_unprocessed_pseudogene':'pseudo',
    'unitary_pseudogene':'pseudo',
    'unprocessed_pseudogene':'pseudo',
    'processed_pseudogene':'pseudo',
    'IG_pseudogene':'pseudo',
    'IG_D_pseudogene':'pseudo',
    '3prime_overlapping_ncrna':'nonCoding',
    'Mt_rRNA':'nonCoding',
    'Mt_tRNA':'nonCoding',
    'antisense':'nonCoding',
    'lincRNA':'nonCoding',
    'miRNA':'nonCoding',
    'misc_RNA':'nonCoding',
    'processed_transcript':'nonCoding',
    'rRNA':'nonCoding',
    'sense_intronic':'nonCoding',
    'sense_overlapping':'nonCoding',
    'snRNA':'nonCoding',
    'snoRNA':'nonCoding',
    '3prime_overlapping_ncRNA':'nonCoding',
    'bidirectional_promoter_lncRNA':'nonCoding',
    'macro_lncRNA':'nonCoding',
    'ribozyme':'nonCoding',
    'sRNA':'nonCoding',
    'scRNA':'nonCoding',
    'scaRNA':'nonCoding',
}

def main():
    d = {}
    fin = sys.argv[1]
    fout = '{}.refbed'.format(fin)
    try:
        with open(fin,"r") as infile:
        # with gzip.open(fin,"rb") as infile:
            with open(fout,'w') as outfile:
                for line in infile:
                    if line.startswith('#'): continue
                    line = line.strip()
                    if not line: continue
#NC_045512.2     RefSeq  gene    266     21555   .       +       .       ID=gene-GU280_gp01;Dbxref=GeneID:43740578;Name=orf1ab;gbkey=Gene;gene=orf1ab;gene_biotype=protein_coding;locus_tag=GU280_g

                    t = line.split('\t')
                    # if t[1] != 'CAT': continue
                    details = {}
                    #print t
#ID=gene-GU280_gp01;Dbxref=GeneID:43740578;Name=orf1ab;gbkey=Gene;gene=orf1ab;gene_biotype=protein_coding;locus_tag=GU280_gp01
                    items = t[8].split(';')
                    for item in items:
                        i = item.split('=')
                        details[i[0]] = i[1]
                    #if t[2].lower() == 'gene':
                    if t[2].lower() == 'transcript':
                        dkey = details['ID']
                        symbol = details['Name'] 
                        biotype = details['transcript_biotype']
                        if biotype in typeMap:
                            newtype = typeMap[biotype]
                        else:
                            newtype = biotype
                        d[dkey] = {'desc': t[8], 'strand': t[6], 'chrom': t[0], 'start': int(t[3])-1, 'end':t[4], 'symbol': symbol, 'exonstarts': [], 'exonends': [], 'cdsstart': int(t[3])-1, 'cdsend':t[4], 'type': newtype}
                    elif t[2].lower() == 'cds' or t[2].lower() == 'exon':
                        dkey = details['Parent']
                        if dkey not in d:
                            print(dkey, 'error')
                            sys.exit(1)
                        else:
                            #print dkey,'out'
                            d[dkey]['exonstarts'].append(str(int(t[3])-1))
                            d[dkey]['exonends'].append(t[4])
                for k in d:
                    v = d[k]
                    outfile.write('{}\t{}\t{}\t{}\t{}\t{}\t{}\t{}\t{}\t'.format(v['chrom'], v['start'], v['end'], v['cdsstart'], v['cdsend'], v['strand'], v['symbol'], k.replace('gene-',''), v['type']))
                    es = sorted(v['exonstarts'], key=lambda x:int(x))
                    ee = sorted(v['exonends'], key=lambda x:int(x))
                    outfile.write('{}\t{}\t{}\n'.format(','.join(es), ','.join(ee), v['desc']))
                    # outfile.write('{}\t{}\n'.format(','.join(es), ','.join(ee)))
                        
    except IOError as message:
        print("cannot open file", message, file=sys.stderr)
        sys.exit(1)

if __name__=="__main__":
    main()


