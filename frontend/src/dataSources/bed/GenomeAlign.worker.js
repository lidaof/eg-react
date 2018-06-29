import GenomeAlignmentWorker from './GenomeAlignmentWorker';
import registerWorkerRunnableSource from '../worker/registerWorkerRunnableSource';

registerWorkerRunnableSource(GenomeAlignmentWorker);

/*
import GenomeAlignWorker from '......GenomeAlign.worker'; <--- this file
import WorkerSource from '......WorkerSource';


const workerSource = new WorkerSource(GenomeAlignWorker, ...args to pass to GenomeAlignmentWorker constructor);
workerSource.getData(...) --> calls the GenomeAlignmentWorker getData method and waits for reply

*/
