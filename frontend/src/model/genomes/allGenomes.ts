import HG19 from "./hg19/hg19";
import HG38 from "./hg38/hg38";
import MM10 from "./mm10/mm10";
import DAN_RER10 from "./danRer10/danRer10";
import DAN_RER11 from "./danRer11/danRer11";
import PANTRO5 from "./panTro5/panTro5";
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
    RN6,
    AraTha1,
    RheMac8,
    GalGal6,
    GalGal5,
    DM6,
    CE11,
    APLCAL3,
    SACCER3
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
        assemblies: [PANTRO5.genome.getName()],
        color: "white"
    },
    rhesus: {
        logoUrl: "https://vizhub.wustl.edu/public/rheMac8/Rhesus_macaque.png",
        assemblies: [RheMac8.genome.getName()],
        color: "yellow"
    },
    cow: {
        logoUrl: "https://vizhub.wustl.edu/public/bosTau8/Cow.png",
        assemblies: [BosTau8.genome.getName()],
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
        assemblies: [DAN_RER11.genome.getName(), DAN_RER10.genome.getName()],
        color: "yellow"
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
        logoUrl: "https://epigenomegateway.wustl.edu/browser/images/Arabidopsis.png",
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
    }
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
