import HG19 from "./hg19/hg19";
import HG38 from "./hg38/hg38";
import MM10 from "./mm10/mm10";
import DAN_RER10 from "./danRer10/danRer10";
import DAN_RER11 from "./danRer11/danRer11";
import DAN_RER7 from "./danRer7/danRer7";
import PANTRO5 from "./panTro5/panTro5";
import PANTRO6 from "./panTro6/panTro6";
import RN6 from "./rn6/rn6";
import MM9 from "./mm9/mm9";
import BosTau8 from "./bosTau8/bosTau8";
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
import nCoV2019 from "./virus/nCoV2019";
import LEPOCU1 from "./lepOcu1/lepOcu1";
import panTro4 from "./panTro4/panTro4";
import gorGor4 from "./gorGor4/gorGor4";
import gorGor3 from "./gorGor3/gorGor3";
import nomLeu3 from "./nomLeu3/nomLeu3";
import papAnu2 from "./papAnu2/papAnu2";
import oryCun2 from "./oryCun2/oryCun2";
import canFam3 from "./canFam3/canFam3";
import rheMac2 from "./rheMac2/rheMac2";
import rheMac3 from "./rheMac3/rheMac3";
import calJac3 from "./calJac3/calJac3";
import Pfal3D7 from "./pfal3d7/pfal3d7";
import Creinhardtii506 from "./Creinhardtii506/Creinhardtii506";
import { GenomeConfig } from "./GenomeConfig";

/**
 * All available genomes.
 */
export const allGenomes = [
  HG19,
  HG38,
  MM10,
  MM9,
  PANTRO5,
  BosTau8,
  DAN_RER10,
  DAN_RER11,
  DAN_RER7,
  RN6,
  AraTha1,
  RheMac8,
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
  LEPOCU1,
  panTro4,
  gorGor4,
  gorGor3,
  nomLeu3,
  papAnu2,
  oryCun2,
  canFam3,
  rheMac2,
  rheMac3,
  calJac3,
  PANTRO6,
  Pfal3D7,
  Creinhardtii506,
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
    assemblies: [HG19.genome.getName(), HG38.genome.getName()],
    color: "white"
  },
  chimp: {
    logoUrl: "https://epigenomegateway.wustl.edu/browser/images/Chimp.png",
    assemblies: [PANTRO6.genome.getName(), PANTRO5.genome.getName(), panTro4.genome.getName()],
    color: "white"
  },
  gorilla: {
    logoUrl: "https://vizhub.wustl.edu/public/gorGor3/Gorilla.png",
    assemblies: [gorGor4.genome.getName(), gorGor3.genome.getName()],
    color: "yellow"
  },
  gibbon: {
    logoUrl: "https://vizhub.wustl.edu/public/nomLeu3/Gibbon.png",
    assemblies: [nomLeu3.genome.getName()],
    color: "yellow"
  },
  baboon: {
    logoUrl: "https://vizhub.wustl.edu/public/papAnu2/Baboon.png",
    assemblies: [papAnu2.genome.getName()],
    color: "yellow"
  },
  rhesus: {
    logoUrl: "https://vizhub.wustl.edu/public/rheMac8/Rhesus_macaque.png",
    assemblies: [RheMac8.genome.getName(), rheMac3.genome.getName(), rheMac2.genome.getName()],
    color: "yellow"
  },
  marmoset: {
    logoUrl: "https://vizhub.wustl.edu/public/calJac3/Marmoset.png",
    assemblies: [calJac3.genome.getName()],
    color: "yellow"
  },
  cow: {
    logoUrl: "https://vizhub.wustl.edu/public/bosTau8/Cow.png",
    assemblies: [BosTau8.genome.getName()],
    color: "yellow"
  },
  rabbit: {
    logoUrl: "https://wangftp.wustl.edu/~xzhuo/browser/oryCun2/rabbit.png",
    assemblies: [oryCun2.genome.getName()],
    color: "yellow"
  },
  dog: {
    logoUrl: "https://wangftp.wustl.edu/~xzhuo/browser/canFam3/dog.png",
    assemblies: [canFam3.genome.getName()],
    color: "yellow"
  },
  mouse: {
    logoUrl: "https://epigenomegateway.wustl.edu/browser/images/Mouse.png",
    assemblies: [MM10.genome.getName(), MM9.genome.getName()],
    color: "yellow"
  },
  rat: {
    logoUrl: "https://epigenomegateway.wustl.edu/browser/images/Rat.png",
    assemblies: [RN6.genome.getName()],
    color: "white"
  },
  chicken: {
    logoUrl: "https://epigenomegateway.wustl.edu/browser/images/Chicken.png",
    assemblies: [GalGal6.genome.getName(), GalGal5.genome.getName()],
    color: "yellow"
  },
  zebrafish: {
    logoUrl: "https://epigenomegateway.wustl.edu/browser/images/Zebrafish.png",
    assemblies: [DAN_RER11.genome.getName(), DAN_RER10.genome.getName(), DAN_RER7.genome.getName()],
    color: "yellow"
  },
  "spotted Gar": {
    logoUrl: "https://vizhub.wustl.edu/public/lepOcu1/SpottedGar.png",
    assemblies: [LEPOCU1.genome.getName()],
    color: "white"
  },
  "fruit fly": {
    logoUrl: "https://epigenomegateway.wustl.edu/legacy/images/Fruit%20fly.png",
    assemblies: [DM6.genome.getName()],
    color: "white"
  },
  "c.elegans": {
    logoUrl: "https://epigenomegateway.wustl.edu/legacy/images/C.elegans.png",
    assemblies: [CE11.genome.getName()],
    color: "black"
  },
  arabidopsis: {
    logoUrl:
      "https://epigenomegateway.wustl.edu/browser/images/Arabidopsis.png",
    assemblies: [AraTha1.genome.getName()],
    color: "yellow"
  },
  seahare: {
    logoUrl: "https://vizhub.wustl.edu/public/aplCal3/seaHare.png",
    assemblies: [APLCAL3.genome.getName()],
    color: "white"
  },
  yeast: {
    logoUrl: "https://epigenomegateway.wustl.edu/browser/images/Yeast.png",
    assemblies: [SACCER3.genome.getName()],
    color: "black"
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
      assemblies: [nCoV2019.genome.getName(), MERS.genome.getName(), SARS.genome.getName(), Ebola.genome.getName()],
      color: "yellow",
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
