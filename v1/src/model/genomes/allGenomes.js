import HG19 from './hg19/hg19';
import MM10 from './mm10/mm10';

const TO_SET_UP = [
    HG19,
    MM10
];

let genomeConfigs = {};
for (let config of TO_SET_UP) {
    const genomeName = config.genome.getName();
    if (genomeConfigs[genomeName]) {
        throw new Error(`Duplicate name ${genomeName} found among genomes!  Refusing to continue.`);
    } else {
        genomeConfigs[genomeName] = config;
    }
}

export const GENOME_NAMES = Object.keys(genomeConfigs);

/**
 * 
 * @param {string} name 
 * @return {GenomeConfig}
 */
export function getGenome(name) {
    return genomeConfigs[name];
}
