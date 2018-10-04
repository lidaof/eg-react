/**
 * Ok, the stupid Typescript compiler refuses to import worker files by default.  So we have this .js file.
 * 
 * @author Silas Hsu
 */
import BedWorker from './bed/Bed.worker';
import BigWorker from './big/Big.worker';
import GenomeAlignWorker from './bed/GenomeAlign.worker';
import LongRangeWorker from "./bed/LongRange.worker";

export { BedWorker };
export { BigWorker };
export { GenomeAlignWorker };
export { LongRangeWorker };
