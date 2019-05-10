import Feature from './Feature';
import ChromosomeInterval from './interval/ChromosomeInterval';



/**
 * A data container for snp.
 *
 * @author Daofeng Li and Silas Hsu
 */
class Snp extends Feature {

    public id: string;
    public alleles?: string[];
    public consequence_type?: string;
    public clinical_significance?: string[];


    /**
     * Constructs a new Snp, given an entry from ensembl API. .
    @example
    {
        alleles: ["G", "C"]
        assembly_name: "GRCh37"
        clinical_significance: []
        consequence_type: "intron_variant"
        end: 140124755
        feature_type: "variation"
        id: "rs1051810366"
        seq_region_name: "7"
        source: "dbSNP"
        start: 140124755
        strand: 1

    }
     * @param {record} record - record object to use
     * @param {trackModel} trackModel for gene search information
     */
    constructor(record: any) {
        const locus = new ChromosomeInterval(`chr${record.seq_region_name}`, record.start - 1, record.end);
        super(record.id, locus, record.strand === 1 ? '+': '-');
        this.id = record.id;
        this.name = record.id;
        this.alleles = record.alleles;
        this.consequence_type = record.consequence_type;
        this.clinical_significance = record.clinical_significance;
    }
}

export default Snp;
