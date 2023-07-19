import sys
import re
import copy


if len(sys.argv) != 4:
    print("python axt.split.py <split_gap_size> <axt file> <output file>")
    sys.exit()


def sub_align(align, relative_start, relative_end):
    ref_seq = align['seqs'][0]
    query_seq = align['seqs'][1]
    sub_align = {}
    sub_align['seqs'] = []
    sub_align['ref_chr'] = align['ref_chr']
    sub_align['query_chr'] = align['query_chr']
    sub_align['strand'] = align['strand']

    sub_align['seqs'].append(ref_seq[relative_start:relative_end])
    prev_ref_seq = ref_seq[0:relative_start]
    prev_ref_gaps = len(re.findall("-", prev_ref_seq))
    sub_align['ref_start'] = align['ref_start'] + relative_start - prev_ref_gaps
    sub_align['ref_end'] = sub_align['ref_start'] + len(re.findall(r'[^-]', sub_align['seqs'][0])) - 1

    sub_align['seqs'].append(query_seq[relative_start:relative_end])
    prev_query_seq = query_seq[0:relative_start]
    prev_query_gaps = len(re.findall("-", prev_query_seq))
    if align['strand'] == "+":
        sub_align['query_start'] = align['query_start'] + relative_start - prev_query_gaps
        sub_align['query_end'] = sub_align['query_start'] + len(re.findall(r'[^-]', sub_align['seqs'][1])) - 1
    else:
        sub_align['query_end'] = align['query_end'] - relative_start + prev_query_gaps
        sub_align['query_start'] = sub_align['query_end'] - len(re.findall(r'[^-]', sub_align['seqs'][1])) + 1
    return sub_align


def split(align, gap_size):
    gaps = []
    for gap in re.finditer(rf'-{{{gap_size},}}', align['seqs'][0]):
        gaps.append(gap.span())
    for gap in re.finditer(rf'-{{{gap_size},}}', align['seqs'][1]):
        gaps.append(gap.span())
    gaps.sort(key=lambda x: x[0])
    relative_start = 0
    aligns = []
    Right_align = copy.deepcopy(align)
    for gap in gaps:
        Left_align = sub_align(align, relative_start, gap[0])
        Right_align = sub_align(align, gap[1], None)
        relative_start = gap[1]
        aligns.append(Left_align)
    aligns.append(Right_align)
    return aligns


gap_size = sys.argv[1]
all_aligns = []
with open(sys.argv[2]) as fin:
    align = {}
    for line in fin:
        if re.match("#", line):
            continue

        list = line.rstrip().split()
        if len(list) >= 8:
            if 'ref_chr' in align:
                aligns = split(align, gap_size)
                all_aligns.extend(aligns)
            align.update({'item': list[0], 'ref_chr': list[1], 'ref_start': int(list[2]), 'ref_end': int(list[3]), 'query_chr': list[4],
                         'query_start': int(list[5]), 'query_end': int(list[6]), 'strand': list[7]})
            align['seqs'] = []
        elif len(list) == 1:
            align['seqs'].append(list[0])
    aligns = split(align, gap_size)
    all_aligns.extend(aligns)

with open(sys.argv[3], 'w') as fout:
    for index, align in enumerate(all_aligns):
        fout.write('{0} {1} {2} {3} {4} {5} {6} {7}\n'.format(index, align['ref_chr'], align['ref_start'], align['ref_end'], 
                   align['query_chr'], align['query_start'], align['query_end'], align['strand']))
        fout.write('{}\n{}\n\n'.format(align['seqs'][0], align['seqs'][1]))
