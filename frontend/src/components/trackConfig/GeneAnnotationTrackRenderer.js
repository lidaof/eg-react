import AnnotationTrackRenderer from "./AnnotationTrackRenderer";
import { configStaticDataSource } from "./configDataFetch";
import GeneAnnotationTrack from "../trackVis/geneAnnotationTrack/GeneAnnotationTrack";
import GeneSource from "../../dataSources/GeneSource";
import Gene from "../../model/Gene";

/**
 * Converts gene data objects from the server to Gene objects.
 *
 * @param {Object[]} data - raw data from server
 * @return {Gene[]} genes made from raw data
 */
function formatDatabaseRecords(data) {
  return data.map(record => new Gene(record));
}
const withDataFetch = configStaticDataSource(
  props => new GeneSource(props.trackModel),
  formatDatabaseRecords
);
const TrackWithData = withDataFetch(GeneAnnotationTrack);

class GeneAnnotationTrackRenderer extends AnnotationTrackRenderer {
  getComponent() {
    return TrackWithData;
  }
}

export default GeneAnnotationTrackRenderer;
