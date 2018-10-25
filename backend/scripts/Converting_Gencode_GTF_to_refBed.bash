#!/bin/bash
#Created 10/18/18 by Renee Sears
##############################TO RUN#####################################
##bash Making_Renee_Gene_Bed.bash <GTF File> <Optional Annotation File>##
#########################################################################

#####################################################################
#############Optional File Annotation Information####################
#Must be in transcript_id description format                        #
#Download from biomart the Transcript stable ID and Gene description#
#####################################################################

my_args=("$@")
my_GTF=$1
my_len=$#

echo "You have provided" $my_len "files"
if [ "$my_len" -eq "0" ]
then
    exit
fi

#Make sure the files exist
if [ ! -f $my_GTF ]; then
        echo $my_GTF" does not exist so exiting"
        exit
fi

if [ "$my_len" -eq "2" ]
then
    my_ANNO=$2
    if [ ! -f $my_ANNO ]; then
        echo $my_ANNO" does not exist so exiting"
    fi
fi

base=${my_GTF%.gtf}

#Basic Format is chr, transript_start, transript_stop, translation_start,translation_stop, strand, gene_name, transcript_id, type, exons(including UTRs regions) start, exons(including UTRs regions) stops, additional gene info
#Note this is designed to take in a Gencode formatted file.

#Let's get most of the information to start
awk -v OFS="\t" '{ if($3=="transcript") print $12,$1,$4-1,$5,".",".",$7,$16,$12,$14,$18,".",".",$10}' $my_GTF | sed 's/;//g' | sed 's/"//g' | sort -k9,9 > First_Part.bed

#Now lets make files containing exons and UTRs
mkdir temp_dir_bed
awk -v OFS="\t" '{ if($3=="exon" || $3=="UTR") print $1,$4-1,$5,$12,$3}' $my_GTF | sed 's/;//g' | sed 's/"//g' |awk '{print>"temp_dir_bed/temp."$4}'

#Now we make a second file to join with the first
touch Second_Part.txt
ml bedtools
#The first part of this command subtracts out the UTR Regions from the EXONIC Regions to get the translations start and stop
#The second part of this command takes the exons and collapses them into a list of starts and stops
for i in temp_dir_bed/* ; do paste <(bedtools subtract -a <(awk '{if($5=="exon") print}' $i) -b <(awk '{if($5=="UTR") print}' $i) | bedtools groupby -g 4 -c 2,3 -o min,max) <(awk '{if($5=="exon") print}' $i | bedtools groupby -g 4 -c 2,3 -o collapse,collapse | awk -v OFS="\t" '{print $2,$3}') >> Second_Part.txt ; done 

#If no annotation provided simply join them
if [ "$my_len" -eq "1" ]
then
    sort -k1,1 Second_Part.txt > Second_Part_Final.txt
    join -j1 First_Part.bed Second_Part_Final.txt -t $'\t' | awk -v OFS="\t" -v FS="\t" '{print $2,$3,$4,$15,$16,$7,$8,$9,$10,$17,$18,"Gene ID:"$14 " Gene Type:"$10 " Transcript Type:"$11}' > Temporary_Gene.bed
fi

#Biomart exports the transcript id without the .1, .2, .3 etc. So we need to join based on the transcript ID without this
if [ "$my_len" -eq "2" ]
then
    join -j1 -t $'\t' <(sort -k1,1 Second_Part.txt | awk -v OFS="\t" '{print $1,$0}' | awk -v OFS="\t" '{gsub(/\..*/,"",$1) ; print}' ) <(sort -k1,1 $my_ANNO) -a 1 > Second_Part_Final.txt
    join -j1 First_Part.bed <( cut -f2- Second_Part_Final.txt) -t $'\t' | awk -v OFS="\t" -v FS="\t" '{print $2,$3,$4,$15,$16,$7,$8,$9,$10,$17,$18,"Gene ID:"$14" Gene Type:"$10" Transcript Type:"$11 " Additional Info:"$19}' > Temporary_Gene.bed
fi

#Awk array to simplify the Gene Types
awk -v FS="\t" -v OFS="\t" '{genes["IG_C_gene"] = "coding"; genes["IG_D_gene"] = "coding";genes["IG_J_gene"] = "coding";genes["IG_V_gene"] = "coding";
    genes["TR_C_gene"] = "coding"; genes["TR_D_gene"] = "coding";genes["TR_J_gene"] = "coding";genes["TR_V_gene"] = "coding";
    genes["polymorphic_pseudogene"] = "coding"; genes["protein_coding"] = "coding";genes["IG_C_pseudogene"] = "pseudo";genes["IG_J_pseudogene"] = "pseudo";
    genes["IG_V_pseudogene"] = "pseudo"; genes["TR_J_pseudogene"] = "pseudo"; genes["TR_V_pseudogene"] = "pseudo"; genes["pseudogene"] = "pseudo";
    genes["3prime_overlapping_ncrna"] = "nonCoding"; genes["Mt_rRNA"] = "nonCoding"; genes["Mt_tRNA"] = "nonCoding"; genes["antisense"] = "nonCoding";
    genes["lincRNA"] = "nonCoding"; genes["miRNA"] = "nonCoding"; genes["misc_RNA"] = "nonCoding"; genes["processed_transcript"] = "nonCoding";
    genes["rRNA"] = "nonCoding"; genes["sense_intronic"] = "nonCoding"; genes["sense_overlapping"] = "nonCoding"; genes["snRNA"] = "nonCoding";
    genes["snoRNA"] = "nonCoding";genes["processed_pseudogene"] = "pseudo";genes["TEC"] = "problem";genes["processed_pseudogene"] = "pseudo";
    genes["transcribed_unitary_pseudogene"] = "pseudo";genes["transcribed_unprocessed_pseudogene"] = "pseudo";genes["unprocessed_pseudogene"] = "pseudo";
    genes["unitary_pseudogene"] = "pseudo";genes["transcribed_processed_pseudogene"] = "pseudo";genes["scRNA"] = "nonCoding";genes["scaRNA"] = "nonCoding";
    genes["bidirectional_promoter_lncRNA"] = "nonCoding";genes["IG_pseudogene"] = "pseudo"; genes["macro_lncRNA"] = "nonCoding"; genes["IG_D_pseudogene"] = "pseudo";
    genes["3prime_overlapping_ncRNA"] = "nonCoding";genes["sRNA"] = "nonCoding"; genes["ribozyme"] = "nonCoding"; genes["IG_LV_gene"] = "coding";
    if ($9 in genes==0) {$9="other"} ; if ($9 in genes){$9=genes[$9]}{print $0}}' Temporary_Gene.bed | sort -k1,1 -k2,2n > $base"_Gene.bed"
rm -r temp_dir_bed
rm First_Part.bed Second_Part.txt Second_Part_Final.txt Temporary_Gene.bed

#Compressing and Indexing
ml htslib
bgzip $base"_Gene.bed"
tabix -p bed $base"_Gene.bed.gz"

echo "Your modified Bed file has been made! Have an awesome day."
