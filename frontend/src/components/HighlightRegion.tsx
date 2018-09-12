import React from 'react';
import OpenInterval from '../model/interval/OpenInterval';
import { MouseButton, getRelativeCoordinates } from '../util';

import './HighlighRegion.css';


interface HighlighRegionProps {
    y?: number | string; // Relative Y of the top of the selection box; how far from the top of this container
    height?: number | string; // Height of the selection box
}

interface HighlighRegionState {
    isHighlighting: boolean;
}

/**
 * Creates and manages the boxes that the user can drag across the screen to select a new region.
 * 
 * @author Silas Hsu
 */
export class HighlighRegion extends React.PureComponent<HighlighRegionProps, HighlighRegionState> {
    static defaultProps: HighlighRegionProps = {
        y: "0px",
        height: "100%",
    };

    /**
     * Initializes state, binds event listeners, and attaches a keyboard listener to the window, which will listen for
     * requests to cancel a selection.
     * 
     * @param {Object} props - props as specified by React
     */
    constructor(props: HighlighRegionProps) {
        super(props);
        this.state = {
            isHighlighting: false,
        }
    }





    /**
     * @inheritdoc
     */
    render(): JSX.Element {
        const {height, y, children} = this.props;
        let theBox = null;
        let className = "HighlighRegion-box";

        const style = {
            left: 100 + "px",
            top: y,
            width: 100 + "px",
            height
        };

        theBox = <div className={className} style={style} >{"xxx"}</div>;
        

        return (
        <div

            style={{position: "relative"}}
        >
            {theBox}
            {children}
        </div>
        );
    }
}
