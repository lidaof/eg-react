import DisplayedRegionModel from '../../model/DisplayedRegionModel';
import SvgComponent from '../SvgComponent';
import PropTypes from 'prop-types';

const HEIGHT = 20;
const BOUNDARY_LINE_EXTENT = 5;
const LABEL_OFFSET = 80;

/**
 * Draws rectangles that represent chromosomes and their labels.
 * 
 * @author Silas Hsu
 * @extends SvgComponent
 */
class Chromosomes extends SvgComponent {
    static propTypes = {
        model: PropTypes.instanceOf(DisplayedRegionModel)
    }

    /**
     * Clears this group and redraws all the chromosomes.
     * 
     * @override
     */
    render() {
        this.group.clear();

        let segments = this.props.model.getSegmentIntervals();
        let x = 0;
        for (let segment of segments) {
            let width = this.props.drawModel.basesToXWidth(segment.getLength());

            this.group.rect(width, HEIGHT).attr({ // Rectangle for each chromosome
                x: x,
                y: BOUNDARY_LINE_EXTENT,
                stroke: "#000",
                "stroke-width": 2,
                fill: "#fff"
            });

            if (x > 0) { // Thick line at boundaries of chromosomes (except the first one)
                let regionBoundaryLine = this.group.line(x, 0, x, BOUNDARY_LINE_EXTENT * 2 + HEIGHT);
                regionBoundaryLine.stroke({width: 4, color: '#000'});
            }

            this.group.text(segment.getName()).attr({ // Chromosome labels
                x: x + width/2,
                y: LABEL_OFFSET,
                "text-anchor": "middle",
                "font-weight": "bold"
            });

            x += width;
        }
        return null;
    }
}

export default Chromosomes;
