import Feature from "./Feature";
import ChromosomeInterval from "./interval/ChromosomeInterval";
import _ from "lodash";
import OpenInterval from "./interval/OpenInterval";

/**
 * A data container for gene annotations.
 *
 * @author Daofeng Li and Silas Hsu
 */
class Gene extends Feature {
  /**
     * Constructs a new Gene, given an entry from MongoDB.  The other parameters calculate absolute
     * coordinates.
    {
        "_id": "5a6a4edfc019c4d5b606c0e8",
        "bin": 792, // UNUSED
        "name": "NR_037940", // 1
        "chrom": "chr7", // 2
        "strand": "-", // 3
        "txStart": 27202056, // 4
        "txEnd": 27219880, // 5
        "cdsStart": 27219880, // 6
        "cdsEnd": 27219880, // 7
        "exonCount": 3, // UNUSED
        "exonStarts": "27202056,27204496,27219264,", // 8
        "exonEnds": "27203460,27204586,27219880,", // 9
        "score": 0, // UNUSED
        "name2": "HOXA10-HOXA9", //10
        "cdsStartStat": "unk", // UNUSED
        "cdsEndStat": "unk", // UNUSED
        "exonFrames": "-1,-1,-1," // UNUSED
    }
     * @param {dbRecord} record - dbRecord object to use
     * @param {trackModel} trackModel for gene search information
     */
  constructor(dbRecord) {
    const locus = new ChromosomeInterval(
      dbRecord.chrom,
      dbRecord.txStart,
      dbRecord.txEnd
    );
    super(dbRecord.name, locus, dbRecord.strand);
    this.dbRecord = dbRecord;
    this.id = dbRecord.id;
    this.name = dbRecord.name;
    this.description = dbRecord.description;
    this.transcriptionClass = dbRecord.transcriptionClass;
    this._translated = null;
    this._utrs = null;
    this.collection = dbRecord.collection; // if there is collection info, assign it
  }

  get translated() {
    if (this._translated === null) {
      this._parseDetails();
    }
    return this._translated;
  }

  get utrs() {
    if (this._utrs === null) {
      this._parseDetails();
    }
    return this._utrs;
  }

  /**
   * Parses `this.dbRecord` and sets `this._translated` and `this._utrs`.
   */
  _parseDetails() {
    const { cdsStart, cdsEnd, exonStarts, exonEnds } = this.dbRecord;
    this._translated = [];
    this._utrs = [];
    if (
      [cdsStart, cdsEnd, exonStarts, exonEnds].some(value => value == undefined) // eslint-disable-line eqeqeq
    ) {
      return;
    }

    const codingInterval = new OpenInterval(cdsStart, cdsEnd);
    const parsedExonStarts = _
      .trim(exonStarts, ",")
      .split(",")
      .map(n => Number.parseInt(n, 10));
    const parsedExonEnds = _
      .trim(exonEnds, ",")
      .split(",")
      .map(n => Number.parseInt(n, 10));
    let exons = _
      .zip(parsedExonStarts, parsedExonEnds)
      .map(twoElementArray => new OpenInterval(...twoElementArray));

    for (let exon of exons) {
      // Get UTRs and translated exons from the raw record
      const codingOverlap = codingInterval.getOverlap(exon);
      if (codingOverlap) {
        this._translated.push(codingOverlap);

        if (exon.start < codingOverlap.start) {
          // 5' UTR
          this._utrs.push(new OpenInterval(exon.start, codingOverlap.start));
        }
        if (codingOverlap.end < exon.end) {
          // 3' UTR
          this._utrs.push(new OpenInterval(codingOverlap.end, exon.end));
        }
      } else {
        // If the length of the coding interval is 0 (i.e. a pseudogene), there will be no overlap and all the
        // exons will be interpreted as untranslated.
        this._utrs.push(exon);
      }
    }
  }

  /**
   * Gets the absolute locations of exons, given the gene body's location within the navigation context.  The
   * navigation context location need not cover the entire gene body, but it *must* overlap with it.
   *
   * @param {DisplayedRegionModel} navContext - location in navigation context that overlaps this instance
   * @return {Object} object with keys `absTranslated` and `absUtrs`
   */
  getAbsExons(navContextLocation) {
    // The absolute location's genome start base.  Directly comparable with exons' base numbers.
    const navContext = navContextLocation.getNavigationContext();
    const absLocation = navContextLocation.getAbsoluteRegion();
    const absLocationGenomeBase = navContext
      .convertBaseToFeatureCoordinate(absLocation.start)
      .getGenomeCoordinates().start;
    const computeExonInterval = function(exon) {
      const distFromAbsLocation = exon.start - absLocationGenomeBase;
      const start = absLocation.start + distFromAbsLocation;
      return absLocation.getOverlap(
        new OpenInterval(start, start + exon.getLength())
      );
    };
    return {
      absTranslated: this.translated
        .map(computeExonInterval)
        .filter(interval => interval != null),
      absUtrs: this.utrs
        .map(computeExonInterval)
        .filter(interval => interval != null)
    };
  }
}

export default Gene;
