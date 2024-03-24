/**
 * Ok, the stupid Typescript compiler refuses to import worker files by default.  So we have this .js file.
 *
 * @author Silas Hsu
 */
import BedWorker from "./bed/Bed.worker";
import BigWorker from "./big/Big.worker";
import BigGmodWorker from "./big/BigGmod.worker";
import GenomeAlignWorker from "./bed/GenomeAlign.worker";
import BallcWorker from "./ballc/Ballc.worker";

export { BedWorker };
export { BigWorker };
export { BigGmodWorker };
export { GenomeAlignWorker };
export { BallcWorker };
