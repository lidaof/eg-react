# this script formats PlasmoDB v9.0 Coding genes so mongoimport can read it.
import urllib
import urllib3

with open('extractedGeneCoordinates.txt')  as fin, open('PlasmoDB9Gene_load','w') as fout:
    next(fin)
    for line in fin:
        t = line.strip().split('\t')
        description = urllib.parse.unquote_plus(t[7])
        # the 2nd to last column is for gene type, or transcriptClass for gencode
        fout.write('{0[1]}\t{0[2]}\t{0[3]}\t{0[2]}\t{0[3]}\t{0[4]}\t{0[6]}\t{0[0]}\t\t{0[2]}\t{0[3]}\t{1}\n'.format(t, description))
