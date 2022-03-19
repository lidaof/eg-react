import { GenomeConfig } from "./GenomeConfig";
import HG19 from "./hg19/hg19";
import HG38 from "./hg38/hg38";
import MM10 from "./mm10/mm10";
import MM39 from "./mm39/mm39";
import DAN_RER10 from "./danRer10/danRer10";
import DAN_RER11 from "./danRer11/danRer11";
import DAN_RER7 from "./danRer7/danRer7";
import PANTRO5 from "./panTro5/panTro5";
import PANTRO6 from "./panTro6/panTro6";
import rn4 from "./rn4/rn4";
import RN6 from "./rn6/rn6";
import RN7 from "./rn7/rn7";
import MM9 from "./mm9/mm9";
import BosTau8 from "./bosTau8/bosTau8";
import rheMac2 from "./rheMac2/rheMac2";
import rheMac3 from "./rheMac3/rheMac3";
import rheMac10 from "./rheMac10/rheMac10";
import RheMac8 from "./rheMac8/rheMac8";
import GalGal6 from "./galGal6/galGal6";
import GalGal5 from "./galGal5/galGal5";
import AraTha1 from "./araTha1/araTha1";
import DM6 from "./dm6/dm6";
import CE11 from "./ce11/ce11";
import APLCAL3 from "./aplCal3/aplCal3";
import SACCER3 from "./sacCer3/sacCer3";
import Ebola from "./virus/ebola";
import SARS from "./virus/sars";
import MERS from "./virus/mers";
import hpv16 from "./virus/hpv16";
import nCoV2019 from "./virus/nCoV2019";
import LEPOCU1 from "./lepOcu1/lepOcu1";
import panTro4 from "./panTro4/panTro4";
import gorGor4 from "./gorGor4/gorGor4";
import gorGor3 from "./gorGor3/gorGor3";
import nomLeu3 from "./nomLeu3/nomLeu3";
import papAnu2 from "./papAnu2/papAnu2";
import oryCun2 from "./oryCun2/oryCun2";
import canFam2 from "./canFam2/canFam2";
import canFam3 from "./canFam3/canFam3";
import monDom5 from "./monDom5/monDom5";
import calJac3 from "./calJac3/calJac3";
import calJac4 from "./calJac4/calJac4";
import Pfal3D7 from "./pfal3d7/pfal3d7";
import TbruceiTREU927 from "./trypanosome/TbruceiTREU927";
import TbruceiLister427 from "./trypanosome/TbruceiLister427";
import Creinhardtii506 from "./Creinhardtii506/Creinhardtii506";
import CHM13v1_1 from "./t2t-chm13-v1.1/chm13";
import xenTro10 from "./xenTro10/xenTro10";
import b_chiifu_v3 from "./brapa/brara_chiifu_v3.0";
import susScr11 from "./susScr11/susScr11";
import susScr3 from "./susScr3/susScr3";
import oviAri4 from "./oviAri4/oviAri4";
import CHMV2 from "./t2t-chm13-v2.0/chm13v2";

/**
 * All available genomes.
 */

export const allGenomes = [
    HG38,
    HG19,
    MM39,
    MM10,
    MM9,
    PANTRO6,
    PANTRO5,
    panTro4,
    BosTau8,
    DAN_RER11,
    DAN_RER10,
    DAN_RER7,
    RN6,
    rn4,
    RheMac8,
    rheMac3,
    rheMac2,
    GalGal6,
    GalGal5,
    DM6,
    CE11,
    APLCAL3,
    SACCER3,
    Ebola,
    SARS,
    MERS,
    nCoV2019,
    hpv16,
    LEPOCU1,
    gorGor4,
    gorGor3,
    nomLeu3,
    papAnu2,
    oryCun2,
    canFam3,
    canFam2,
    monDom5,
    calJac3,
    AraTha1,
    Pfal3D7,
    Creinhardtii506,
    TbruceiTREU927,
    TbruceiLister427,
    CHM13v1_1,
    xenTro10,
    b_chiifu_v3,
    susScr11,
    susScr3,
    oviAri4,
    calJac4,
    rheMac10,
    RN7,
    CHMV2,
];

const genomeNameToConfig = {};
for (const config of allGenomes) {
    const genomeName = config.genome.getName();
    if (genomeNameToConfig[genomeName]) {
        // We need this, because when saving session, we save the genome name.
        throw new Error(`Two genomes have the same name ${genomeName}.  Refusing to continue!`);
    }
    genomeNameToConfig[genomeName] = config;
}

interface SpeciesConfig {
    logoUrl: string;
    assemblies: string[];
    color: string;
}

export const treeOfLife: { [speciesName: string]: SpeciesConfig } = {
    human: {
        logoUrl: "https://epigenomegateway.wustl.edu/browser/images/Human.png",
        assemblies: [HG19.genome.getName(), HG38.genome.getName(), CHM13v1_1.genome.getName(), CHMV2.genome.getName()],
        color: "white",
    },
    chimp: {
        logoUrl: "https://epigenomegateway.wustl.edu/browser/images/Chimp.png",
        assemblies: [PANTRO6.genome.getName(), PANTRO5.genome.getName(), panTro4.genome.getName()],
        color: "white",
    },
    gorilla: {
        logoUrl: "https://vizhub.wustl.edu/public/gorGor3/Gorilla.png",
        assemblies: [gorGor4.genome.getName(), gorGor3.genome.getName()],
        color: "yellow",
    },
    gibbon: {
        logoUrl: "https://vizhub.wustl.edu/public/nomLeu3/Gibbon.png",
        assemblies: [nomLeu3.genome.getName()],
        color: "yellow",
    },
    baboon: {
        logoUrl: "https://vizhub.wustl.edu/public/papAnu2/Baboon.png",
        assemblies: [papAnu2.genome.getName()],
        color: "yellow",
    },
    rhesus: {
        logoUrl: "https://vizhub.wustl.edu/public/rheMac8/Rhesus_macaque.png",
        assemblies: [
            rheMac10.genome.getName(),
            RheMac8.genome.getName(),
            rheMac3.genome.getName(),
            rheMac2.genome.getName(),
        ],
        color: "yellow",
    },
    marmoset: {
        logoUrl: "https://vizhub.wustl.edu/public/calJac3/Marmoset.png",
        assemblies: [calJac4.genome.getName(), calJac3.genome.getName()],
        color: "yellow",
    },
    cow: {
        logoUrl: "https://vizhub.wustl.edu/public/bosTau8/Cow.png",
        assemblies: [BosTau8.genome.getName()],
        color: "yellow",
    },
    sheep: {
        logoUrl: "https://vizhub.wustl.edu/public/oviAri4/sheep.png",
        assemblies: [oviAri4.genome.getName()],
        color: "white",
    },
    pig: {
        logoUrl: "https://vizhub.wustl.edu/public/susScr11/pig.png",
        assemblies: [susScr11.genome.getName(), susScr3.genome.getName()],
        color: "white",
    },
    rabbit: {
        logoUrl: "https://vizhub.wustl.edu/public/oryCun2/rabbit.png",
        assemblies: [oryCun2.genome.getName()],
        color: "yellow",
    },
    dog: {
        logoUrl: "https://vizhub.wustl.edu/public/canFam3/dog.png",
        assemblies: [canFam3.genome.getName(), canFam2.genome.getName()],
        color: "yellow",
    },
    mouse: {
        logoUrl: "https://epigenomegateway.wustl.edu/browser/images/Mouse.png",
        assemblies: [MM39.genome.getName(), MM10.genome.getName(), MM9.genome.getName()],
        color: "yellow",
    },
    rat: {
        logoUrl: "https://epigenomegateway.wustl.edu/browser/images/Rat.png",
        assemblies: [RN7.genome.getName(), RN6.genome.getName(), rn4.genome.getName()],
        color: "white",
    },
    opossum: {
        logoUrl: "https://vizhub.wustl.edu/public/monDom5/opossum.png",
        assemblies: [monDom5.genome.getName()],
        color: "white",
    },
    chicken: {
        logoUrl: "https://epigenomegateway.wustl.edu/browser/images/Chicken.png",
        assemblies: [GalGal6.genome.getName(), GalGal5.genome.getName()],
        color: "yellow",
    },
    frog: {
        logoUrl: "https://vizhub.wustl.edu/public/xenTro10/frog.png",
        assemblies: [xenTro10.genome.getName()],
        color: "white",
    },
    zebrafish: {
        logoUrl: "https://epigenomegateway.wustl.edu/browser/images/Zebrafish.png",
        assemblies: [DAN_RER11.genome.getName(), DAN_RER10.genome.getName(), DAN_RER7.genome.getName()],
        color: "yellow",
    },
    "spotted Gar": {
        logoUrl: "https://vizhub.wustl.edu/public/lepOcu1/SpottedGar.png",
        assemblies: [LEPOCU1.genome.getName()],
        color: "white",
    },
    "fruit fly": {
        logoUrl: "https://epigenomegateway.wustl.edu/legacy/images/Fruit%20fly.png",
        assemblies: [DM6.genome.getName()],
        color: "white",
    },
    "c.elegans": {
        logoUrl: "https://epigenomegateway.wustl.edu/legacy/images/C.elegans.png",
        assemblies: [CE11.genome.getName()],
        color: "black",
    },
    arabidopsis: {
        logoUrl: "https://epigenomegateway.wustl.edu/browser/images/Arabidopsis.png",
        assemblies: [AraTha1.genome.getName()],
        color: "yellow",
    },
    brapa: {
        logoUrl: "https://vizhub.wustl.edu/public/b_chiifu_v3/brapa.png",
        assemblies: [b_chiifu_v3.genome.getName()],
        color: "white",
    },
    seahare: {
        logoUrl: "https://vizhub.wustl.edu/public/aplCal3/seaHare.png",
        assemblies: [APLCAL3.genome.getName()],
        color: "white",
    },
    yeast: {
        logoUrl: "https://epigenomegateway.wustl.edu/browser/images/Yeast.png",
        assemblies: [SACCER3.genome.getName()],
        color: "black",
    },
    "P. falciparum": {
        logoUrl: "https://epigenomegateway.wustl.edu/browser/images/Pfalciparum.png",
        assemblies: [Pfal3D7.genome.getName()],
        color: "black",
    },
    "Green algae": {
        logoUrl: "https://vizhub.wustl.edu/public/Creinhardtii506/Creinhardtii506.png",
        assemblies: [Creinhardtii506.genome.getName()],
        color: "yellow",
    },
    virus: {
        logoUrl: "https://vizhub.wustl.edu/public/virus/virus.png",
        assemblies: [
            nCoV2019.genome.getName(),
            MERS.genome.getName(),
            SARS.genome.getName(),
            Ebola.genome.getName(),
            hpv16.genome.getName(),
        ],
        color: "yellow",
    },
    trypanosome: {
        logoUrl: "https://vizhub.wustl.edu/public/trypanosome/trypanosome.png",
        assemblies: [TbruceiTREU927.genome.getName(), TbruceiLister427.genome.getName()],
        color: "blue",
    },
};

/**
 * @param {string} genomeName - name of a genome
 * @return {GenomeConfig} the genome's configuration object, or null if no such genome exists.
 */
export function getGenomeConfig(genomeName: string): GenomeConfig {
    return genomeNameToConfig[genomeName] || null;
}

export function getSpeciesInfo(genomeName: string) {
    for (const [species, details] of Object.entries(treeOfLife)) {
        if (details.assemblies.includes(genomeName)) {
            return { name: species, logo: details.logoUrl, color: details.color };
        }
    }
    return { name: "", logo: "", color: "" };
}
