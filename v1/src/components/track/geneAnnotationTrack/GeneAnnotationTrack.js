import React from 'react';

import AnnotationArranger from './AnnotationArranger';
import GeneDetail from './GeneDetail';

import { TRACK_PROP_TYPES } from '../Track'
import TrackLegend from '../TrackLegend';
import TrackLoadingNotice from '../TrackLoadingNotice';
import withExpandedWidth from '../../withExpandedWidth';

import RegionExpander from '../../../model/RegionExpander';

const HEIGHT = 120;

const WideSvg = withExpandedWidth('svg');

/**
 * A gene annotation track.
 * 
 * @author Silas Hsu
 */
class GeneAnnotationTrack extends React.Component {
    static propTypes = TRACK_PROP_TYPES;

    constructor(props) {
        super(props);
        this.state = {
            geneDetail: null
        };

        this.geneClicked = this.geneClicked.bind(this);
        this.divNode = null;
        this.viewExpansion = null;
        this._updateViewExpansion(props);
    }

    _updateViewExpansion(props) {
        const regionExpander = new RegionExpander(props.viewExpansionValue);
        this.viewExpansion = regionExpander.calculateExpansion(props.width, props.viewRegion);
    }

    componentWillUpdate(nextProps) {
        if (this.props.width !== nextProps.width || this.props.viewRegion !== nextProps.viewRegion) {
            this._updateViewExpansion(nextProps);
        }
    }

    /**
     * Called when a gene annotation is clicked.  Sets state so a detail box is displayed.
     * 
     * @param {MouseEvent} event 
     * @param {Gene} gene 
     */
    geneClicked(event, gene) {
        event.stopPropagation();
        let detail = <GeneDetail
            left={event.clientX}
            top={event.clientY}
            rightBoundary={this.divNode.clientWidth}
            gene={gene}
        />;
        this.setState({geneDetail: detail});
    }

    render() {
        let svgStyle = {paddingTop: 10, display: "block"};
        if (this.props.error) {
            svgStyle.backgroundColor = "red";
        }

        return (
        <div
            style={{display: "flex", borderBottom: "1px solid grey"}}
            ref={node => this.divNode = node}
            onClick={(event) => this.setState({geneDetail: null})}
        >
            <TrackLegend height={HEIGHT} trackModel={this.props.trackModel} />
            {this.props.isLoading ? <TrackLoadingNotice height={this.props.height} /> : null}
            <WideSvg
                visibleWidth={this.props.width} // Three props that withExpandedWidth() adds
                viewExpansion={this.viewExpansion}
                xOffset={this.props.xOffset}

                height={HEIGHT}
                style={svgStyle}
            >
                <AnnotationArranger
                    data={this.props.data}
                    viewExpansion={this.viewExpansion}
                    maxRows={this.props.maxRows}
                    onGeneClick={this.geneClicked}
                />
            </WideSvg>
            {this.state.geneDetail}
        </div>
        );
    }
}

export default GeneAnnotationTrack;
