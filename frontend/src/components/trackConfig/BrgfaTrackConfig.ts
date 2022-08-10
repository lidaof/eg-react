import { GraphNode, nodeFromRawNode } from './../../model/graph/GraphNode';
import YscaleConfig from "components/trackContextMenu/YscaleConfig";
import { AnnotationDisplayModes } from "../../model/DisplayModes";
import { AnnotationTrackConfig } from "./AnnotationTrackConfig";
import { GraphTrack } from "../trackVis/graphTrack/GraphTrack";
import WorkerSource from "../../dataSources/worker/WorkerSource";
import { BedWorker } from "../../dataSources/WorkerTSHook";
import BedRecord from "../../dataSources/bed/BedRecord";
import ChromosomeInterval from "../../model/interval/ChromosomeInterval";
import LocalBedSource from "../../dataSources/LocalBedSource";
import BedTextSource from "../../dataSources/BedTextSource";
import HiddenPixelsConfig from "../trackContextMenu/HiddenPixelsConfig";
import AlwaysDrawLabelConfig from "components/trackContextMenu/AlwaysDrawLabelConfig";
import { GraphLink } from 'model/graph/GraphLink';

export class BrgfaTrackConfig extends AnnotationTrackConfig {
    initDataSource() {
        if (this.trackModel.isText) {
            return new BedTextSource({
                url: this.trackModel.url,
                blob: this.trackModel.fileObj,
                textConfig: this.trackModel.textConfig,
            });
        } else {
            if (this.trackModel.files.length > 0) {
                return new LocalBedSource(this.trackModel.files);
            } else {
                return new WorkerSource(BedWorker, this.trackModel.url, this.trackModel.indexUrl);
            }
        }
    }

    /**
     * Converts BedRecords to graph data.
     *
     * @param {BedRecord[]} data - bed records to convert
     */
    formatData(data: BedRecord[]) {
        const nodes = new Map();
        const links:GraphLink[] = [];
        data.forEach(
            (record) => {
                const locus = new ChromosomeInterval(record.chr, record.start, record.end);
                const sname = record[3];
                const snode =new GraphNode(sname, locus)
                if(!nodes.has(sname)){
                    nodes.set(sname, snode);
                }
                const json = JSON.parse(record[4]);
                json.forEach((j:any) => {
                    if (j.hasOwnProperty('s')){
                        // this is source
                        const node = nodeFromRawNode(j['s'])
                        links.push(new GraphLink(node, snode, j['ss'], j['ts'], j['r']))
                    } else if (j.hasOwnProperty('t')){
                        // this is target
                        const node = nodeFromRawNode(j['t'])
                        links.push(new GraphLink(snode, node, j['ss'], j['ts'], j['r']))
                    }
                })
            }
        )
        return {nodes, links}
    }

    getComponent() {
        return GraphTrack;
    }

    getMenuComponents() {
        const items = [...super.getMenuComponents(), HiddenPixelsConfig, AlwaysDrawLabelConfig];
        if (this.getOptions().displayMode === AnnotationDisplayModes.DENSITY) {
            items.push(YscaleConfig);
        }
        return items;
    }
}
