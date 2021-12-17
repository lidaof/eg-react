import BedSourceWorker from "./TabixSource";
import registerWorkerRunnableSource from "../worker/registerWorkerRunnableSource";

registerWorkerRunnableSource(BedSourceWorker);
