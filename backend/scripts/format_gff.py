#!/usr/bin/python
# programmer : Daofeng
# usage:

# convert regular gff to refbed for browser

import sys
from urllib.parse import unquote_plus


'''
Tb927_08_v5.1   VEuPathDB       gene    1387684 1390532 .       -       .       ID=Tb927.8.4730;description=amino acid transporter%2C putative
Tb927_08_v5.1   VEuPathDB       mRNA    1387684 1390532 .       -       .       ID=Tb927.8.4730:mRNA;Parent=Tb927.8.4730;Ontology_term=GO_0005275,GO_0005737,GO_0006865;description=amino acid transporter%2C put
Tb927_08_v5.1   VEuPathDB       exon    1387684 1390532 .       -       .       ID=exon_Tb927.8.4730-E1;Parent=Tb927.8.4730:mRNA
Tb927_08_v5.1   VEuPathDB       CDS     1389086 1390462 .       -       0       ID=Tb927.8.4730:mRNA-p1-CDS1;Parent=Tb927.8.4730:mRNA;protein_source_id=Tb927.8.4730:mRNA-p1
Tb927_08_v5.1   VEuPathDB       three_prime_UTR 1387684 1389085 .       -       .       ID=utr_Tb927.8.4730:mRNA_1;Parent=Tb927.8.4730:mRNA
Tb927_08_v5.1   VEuPathDB       five_prime_UTR  1390463 1390532 .       -       .       ID=utr_Tb927.8.4730:mRNA_2;Parent=Tb927.8.4730:mRNA
'''

def main():
    d = {}
    fin = sys.argv[1]
    fout = '{}.refbed'.format(fin)
    try:
        with open(fin,"rU") as infile:
            with open(fout,'w') as outfile:
                for line in infile:
                    if line.startswith('#'): continue
                    if line.startswith('unitig'): continue #
                    line = line.strip()
                    if not line: continue
                    t = line.split('\t')
                    details = {}
                    #print t
                    items = t[8].split(';')
                    for item in items:
                        i = item.split('=')
                        details[i[0]] = i[1]
                    if 'rna' in t[2].lower():
                        dkey = details['ID']
                        if 'Name' in details:
                            symbol = details['Name'] 
                        else:
                            symbol = dkey
                        if 'description' in details:
                            desc = unquote_plus(details['description'])
                        else:
                            desc = unquote_plus(t[8])
                        d[dkey] = {'desc': desc, 'strand': t[6], 'chrom': t[0], 'start': int(t[3])-1, 'end':t[4], 'symbol': symbol, 'exonstarts': [], 'exonends': [], 'cdsstart': int(t[3])-1, 'cdsend':t[4]}
                    elif t[2].lower() == 'cds' or t[2].lower() == 'exon':
                        dkey = details['Parent']
                        if dkey not in d:
                            print(dkey, 'error')
                        else:
                            # print(dkey,'out')
                            d[dkey]['exonstarts'].append(str(int(t[3])-1))
                            d[dkey]['exonends'].append(t[4])
                for k in d:
                    v = d[k]
                    outfile.write('{}\t{}\t{}\t{}\t{}\t{}\t{}\t{}\t\t'.format(v['chrom'], v['start'], v['end'], v['cdsstart'], v['cdsend'], v['strand'], v['symbol'], k))
                    es = sorted(v['exonstarts'], key=lambda x:int(x))
                    ee = sorted(v['exonends'], key=lambda x:int(x))
                    outfile.write('{}\t{}\t{}\n'.format(','.join(es), ','.join(ee), v['desc']))
                        
    except IOError as message:
        print >> sys.stderr, "cannot open file",message
        sys.exit(1)

if __name__=="__main__":
    main()
