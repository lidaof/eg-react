

export function getGenomeContainerTitle(genomes: string[]): string {
    if (genomes.length === 1) {
        return genomes[0];
    } else if (genomes.length === 2) {
        return `${genomes[0]} and ${genomes[1]}`;
    } else {
        return `${genomes.slice(0, -1).join(', ')} and ${genomes[genomes.length - 1]}`;
    }
};