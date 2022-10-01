import HeightConfig from "components/trackContextMenu/HeightConfig";
import { GraphDisplayModes } from "./../../model/DisplayModes";
import LabelConfig from "components/trackContextMenu/LabelConfig";
import { GraphNode, IRawNode, nodeFromRawNode } from "./../../model/graph/GraphNode";
import { AnnotationTrackConfig } from "./AnnotationTrackConfig";
import { GraphTrack } from "../trackVis/graphTrack/GraphTrack";
import WorkerSource from "../../dataSources/worker/WorkerSource";
import { BedWorker } from "../../dataSources/WorkerTSHook";
import BedRecord from "../../dataSources/bed/BedRecord";
import ChromosomeInterval from "../../model/interval/ChromosomeInterval";
import LocalBedSource from "../../dataSources/LocalBedSource";
import BedTextSource from "../../dataSources/BedTextSource";
import { GraphLink } from "model/graph/GraphLink";
import { GraphDisplayModeConfig } from "components/trackContextMenu/DisplayModeConfig";
import { Strand } from "model/Feature";

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
        const links: GraphLink[] = [];
        const linkCounts = new Map(); // key: node name, value: [link count as source rank0, link count as source rank1, link count as target rank0, link count as target rank1]
        data.forEach((record) => {
            const locus = new ChromosomeInterval(record.chr, record.start, record.end);
            const sname = record[3];
            let c1 = 0,
                c2 = 0,
                c3 = 0,
                c4 = 0;
            const snode = new GraphNode(sname, locus);
            if (!nodes.has(sname)) {
                nodes.set(sname, snode);
            }
            const json = JSON.parse(record[4]);
            json.forEach((j: RawLinkRecord) => {
                let node: GraphNode;
                if (j.hasOwnProperty("s")) {
                    // this is source
                    node = nodeFromRawNode(j["s"]);
                    links.push(new GraphLink(node, snode, j["ss"], j["ts"], j["r"]));
                    if (j["r"] === 0) {
                        c1 += 1;
                    } else {
                        c2 += 1;
                    }
                } else if (j.hasOwnProperty("t")) {
                    // this is target
                    node = nodeFromRawNode(j["t"]);
                    links.push(new GraphLink(snode, node, j["ss"], j["ts"], j["r"]));
                    if (j["r"] === 0) {
                        c3 += 1;
                    } else {
                        c4 += 1;
                    }
                }
                if (!nodes.has(node.getName())) {
                    nodes.set(node.getName(), node);
                }
            });
            linkCounts.set(sname, [c1, c2, c3, c4]);
        });
        return { nodes, links, linkCounts };
    }

    getComponent() {
        return GraphTrack;
    }

    getMenuComponents() {
        const items = [LabelConfig, GraphDisplayModeConfig];
        if (this.getOptions().displayMode === GraphDisplayModes.DENSITY) {
            items.push(HeightConfig);
        }
        return items;
    }
}

interface RawLinkRecord {
    s?: IRawNode; //source
    t?: IRawNode; //target
    ss: Strand; // source strand
    ts: Strand; // target strand
    r: number; // ranking
}
