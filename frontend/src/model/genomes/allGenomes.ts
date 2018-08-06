import HG19 from './hg19/hg19';
import HG38 from './hg38/hg38';
import MM10 from './mm10/mm10';
import DAN_RER10 from './danRer10/danRer10';
import { GenomeConfig } from './GenomeConfig';

/**
 * All available genomes.
 */
const allGenomes = [
    HG19,
    HG38,
    MM10,
    DAN_RER10
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

export const treeOfLife = {
    human: {
        logo: 'http://epigenomegateway.wustl.edu/browser/images/Human.png',
        assemblies: [HG19.genome.getName(), HG38.genome.getName()],
        color: 'white',
    },
    mouse: {
        logo: 'http://epigenomegateway.wustl.edu/browser/images/Mouse.png',
        assemblies: [MM10.genome.getName()],
        color: 'white',
    },
    zebrafish: {
        logo: 'http://epigenomegateway.wustl.edu/browser/images/Zebrafish.png',
        assemblies: [DAN_RER10.genome.getName()],
        color: 'yellow',
    },
};

/**
 * @param {string} genomeName - name of a genome
 * @return {GenomeConfig} the genome's configuration object, or null if no such genome exists.
 */
export function getGenomeConfig(genomeName: string): GenomeConfig {
    return genomeNameToConfig[genomeName] || null;
}

export function getGenomeInfo(genomeName: string): any {
    for (const [species, details] of Object.entries(treeOfLife) ) {
        if (details.assemblies.includes(genomeName)) {
            return {name: species, logo: details.logo, color: details.color}
        }
    }
    return {name: '', logo: '', color: ''};
}
