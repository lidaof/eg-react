import React from 'react'
import PropTypes from 'prop-types';

import HoverTooltipContext from '../tooltip/HoverTooltipContext';
import DesignRenderer from '../../../../art/DesignRenderer';

/**
 * Component that renders a bar chart graphic.
 * 
 * @author Silas Hsu
 */
class BarPlot extends React.PureComponent {
    static propTypes = {
        data: PropTypes.array.isRequired,
        width: PropTypes.number.isRequired, // Graphic width
        height: PropTypes.number.isRequired, // Graphic height
        style: PropTypes.object, // CSS
        htmlType: PropTypes.number, // Actual type of HTML element to render.  See DesignRenderer.js

        /**
         * Callback for getting a bar element to render.  Signature (x: number, record: any): JSX.Element
         */
        getBarElement: PropTypes.func.isRequired,
        /**
         * Called when the user mouses over the graphic.  Should return tooltip contents to render.  Signature
         *     (relativeX: number, value: any): JSX.Element
         *         `relativeX`: the x coordinate of the mouse hover, relative to the left of the container
         *         `value`: record at this x location
         */
        getTooltipContents: PropTypes.func,
    };

    static defaultProps = {
        getTooltipContents: (relativeX, records) => null
    };

    /**
     * Binds event listeners.
     * 
     * @param {Object} props - props as specified by React
     */
    constructor(props) {
        super(props);
        this.getTooltipContents = this.getTooltipContents.bind(this);
    }

    /**
     * 
     * @param {*} event 
     * @return {JSX.Element}
     */
    getTooltipContents(relativeX) {
        const value = this.props.data[Math.round(relativeX)];
        return this.props.getTooltipContents(relativeX, value);
    }

    /**
     * @inheritdoc
     */
    render() {
        const {data, width, height, style, htmlType, getBarElement} = this.props;
        let barElements = data.map(getBarElement);

        return (
        <HoverTooltipContext tooltipRelativeY={height} getTooltipContents={this.getTooltipContents} >
            <DesignRenderer
                type={htmlType}
                width={width}
                height={height}
                style={style}
            >
                {barElements}
            </DesignRenderer>
        </HoverTooltipContext>
        );
    }
}

export default BarPlot;