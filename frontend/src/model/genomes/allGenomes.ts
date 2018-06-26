import HG19 from './hg19/hg19';
import MM10 from './mm10/mm10';
import DAN_RER10 from './danRer10/danRer10';
import { GenomeConfig } from './GenomeConfig';

/**
 * All available genomes.
 */
export const allGenomes = [
    HG19,
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

/**
 * @param {string} genomeName - name of a genome
 * @return {GenomeConfig} the genome's configuration object, or null if no such genome exists.
 */
export function getGenomeConfig(genomeName: string): GenomeConfig {
    return genomeNameToConfig[genomeName] || null;
}

export default allGenomes;
