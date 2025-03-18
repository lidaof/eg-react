#!/usr/bin/python
# programmer : Daofeng
# usage: adds an additional column that contains transcript class to gencode raw data files

import sys

def main():
    d = {} # key: transcription id, value: transcriptClass
    with open('wgEncodeGencodeAttrsV47lift37.txt') as fin:
        for line in fin:
            t = line.strip().split('\t')
            d[t[4]] = t[12]
    with open('wgEncodeGencodeCompV47lift37.txt',"r") as infile:
        with open('wgEncodeGencodeCompV47lift37.with_transcriptClass.txt','w') as outfile:
            for line in infile:
                line = line.strip()
                t = line.split('\t')
                outfile.write('{}\t{}\n'.format(line, d[t[1]]))

if __name__=="__main__":
    main()
