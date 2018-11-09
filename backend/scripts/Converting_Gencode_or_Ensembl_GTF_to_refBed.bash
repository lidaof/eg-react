#!/bin/bash
#Created 10/18/18 by Renee Sears
##############################TO RUN#####################################
##bash Converting_Gencode_or_Ensembl_GTF_to_refBed.bash <Gencode or Ensembl> <GTF File> <Optional Annotation File>##
#########################################################################

#####################################################################
#############Optional File Annotation Information####################
#Must be in transcript_id description format                        #
#Download from biomart the Transcript stable ID and Gene description#
#####################################################################

###############################################################################
##Note after column 8 in the gtf spaces are used to work as a delimiter       #
#This means gene names CAN NOT have spaces, correct these before use          #
#Example: sed -i 's/ (1 of many)/_(1_of_many)/g' Danio_rerio.GRCz10.91.chr.gtf#
###############################################################################

my_args=("$@")
my_type=$1
my_GTF=$2
my_len=$#

if [ "$my_type" != "Gencode" ] && [ "$my_type" != "Ensembl" ]
then
    echo "Run Script: Making_Renee_Gene_Bed.bash <Gencode or Ensembl> <GTF File> <Optional Annotation File>"
    echo "Please Specify the GTF type as Gencode or Ensembl"
    exit
fi
my_count=`expr $my_len - 1`
echo "You have provided" $my_count "file(s)"
if [ "$my_len" -eq "0" ]
then
    exit
fi

#Make sure the files exist
if [ ! -f $my_GTF ]; then
        echo $my_GTF" does not exist so exiting"
        exit
fi

if [ "$my_len" -eq "3" ]
then
    my_ANNO=$3
    if [ ! -f $my_ANNO ]; then
        echo $my_ANNO" does not exist so exiting"
        exit
    fi
fi

echo "ALL Files Exist, so moving forward"
base=${my_GTF%.gtf}

#Basic Format is chr, transript_start, transript_stop, translation_start,translation_stop, strand, gene_name, transcript_id, type, exons(including UTRs regions) start, exons(including UTRs regions) stops, additional gene info

#Gencode formatted file.
if [ "$my_type" == "Gencode" ]
then
  #Let's get most of the information to start
  echo "Gencode Format Specified"
  awk -v OFS="\t" '{ if($3=="transcript") print $12,$1,$4-1,$5,".",".",$7,$16,$12,$14,$18,".",".",$10}' $my_GTF |
  sed 's/;//g' | sed 's/"//g' | sort -k9,9 > First_Part.bed

  #Now lets make files containing exons and UTRs
  mkdir temp_dir_bed
  awk -v OFS="\t" '{ if($3=="exon" || $3=="UTR") print $1,$4-1,$5,$12,$3}' $my_GTF |
  sed 's/;//g' | sed 's/"//g' |awk '{print>"temp_dir_bed/temp."$4}'
fi

#Ensembl formatted file.
if [ "$my_type" == "Ensembl" ]
then
  #ENSEMBL NEED TO ADD CHR
  echo "Ensembl Format Specified, Adding chr to GTF"
  awk '{print "chr"$0}' $my_GTF | sed 's/chr#!/#!/g' > THIS_IS_TEMP.gtf
  my_GTF=THIS_IS_TEMP.gtf
  #Let's get most of the information to start
  awk -v OFS="\t" '{ if($3=="transcript" && $0~"gene_name") print $14,$1,$4-1,$5,".",".",$7,$18,$14,$22,$28,".",".",$10;else if($3=="transcript" && $0!~"gene_name") print $14,$1,$4-1,$5,".",".",$7,$10,$14,$20,$24,".",".",$10}' $my_GTF |
  sed 's/;//g' | sed 's/"//g' | sort -k9,9 > First_Part.bed

  #Now lets make files containing exons and UTRs
  mkdir temp_dir_bed
  awk -v OFS="\t" '{ if($3=="exon" || $3~"utr") print $1,$4-1,$5,$14,$3=="exon"?$3:"UTR"}' $my_GTF |
  sed 's/;//g' | sed 's/"//g' |awk '{print>"temp_dir_bed/temp."$4}'
  rm THIS_IS_TEMP.gtf
fi

echo "Go get lunch, this is gonna take a bit..."
#Now we make a second file to join with the first
touch Second_Part.txt
ml bedtools
#The first part of this command subtracts out the UTR Regions from the EXONIC Regions to get the translations start and stop
#The second part of this command takes the exons and collapses them into a list of starts and stops
for i in temp_dir_bed/* ; do paste <(bedtools subtract -a <(awk '{if($5=="exon") print}' $i) -b <(awk '{if($5=="UTR") print}' $i) |
bedtools groupby -g 4 -c 2,3 -o min,max) <(awk '{if($5=="exon") print}' $i | bedtools groupby -g 4 -c 2,3 -o collapse,collapse | awk -v OFS="\t" '{print $2,$3}') >> Second_Part.txt ; done

#If no annotation provided simply join them
if [ "$my_len" -eq "2" ]
then
    sort -k1,1 Second_Part.txt > Second_Part_Final.txt
    join -j1 First_Part.bed Second_Part_Final.txt -t $'\t' | awk -v OFS="\t" -v FS="\t" '{print $2,$3,$4,$15,$16,$7,$8,$9,$10,$17,$18,"Gene ID:"$14 " Gene Type:"$10 " Transcript Type:"$11}' > Temporary_Gene.bed
fi

#Biomart exports the transcript id without the .1, .2, .3 etc. So we need to join based on the transcript ID without this
if [ "$my_len" -eq "3" ]
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
    genes["antisense_RNA"] = "nonCoding";genes["translated_unprocessed_pseudogene"]="pseudo";genes["translated_processed_pseudogene"]="pseudo";
    genes["rRNA_pseudogene"]="pseudo"; genes["non_coding"]="nonCoding";
    if ($9 in genes==0) {$9="other"} ; if ($9 in genes){$9=genes[$9]}{print $0}}' Temporary_Gene.bed | sort -k1,1 -k2,2n > $base"_Gene.bed"
rm -r temp_dir_bed
rm First_Part.bed Second_Part.txt Second_Part_Final.txt Temporary_Gene.bed

#Compressing and Indexing
ml htslib
bgzip $base"_Gene.bed"
tabix -p bed $base"_Gene.bed.gz"

echo "Your modified Bed file has been made! Have an awesome day."
