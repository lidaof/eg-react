import React from "react";
import PropTypes from "prop-types";
import { notify } from "react-notify-toast";
import NavigationContext from "model/NavigationContext";
import GeneSearchBoxBase from "./GeneSearchBoxBase";

/**
 * A box that accepts gene name queries, and gives suggestions as well.
 *
 * @author Daofeng Li and Silas Hsu
 */
class GeneSearchBox extends React.PureComponent {
    static propTypes = {
        navContext: PropTypes.instanceOf(NavigationContext).isRequired, // The current navigation context
        /**
         * Called when the user chooses a gene and wants to go to it in the nav context.  Signature:
         *     (newStart: number, newEnd: number): void
         *         `newStart`: the nav context coordinate of the start of the view interval
         *         `newEnd`: the nav context coordinate of the end of the view interval
         */
        onRegionSelected: PropTypes.func.isRequired,
        handleCloseModal: PropTypes.func.isRequired,
        onToggleHighlight: PropTypes.func,
    };

    /**
     * @param {Gene} gene
     */
    setViewToGene = (gene) => {
        const interval = this.props.navContext.convertGenomeIntervalToBases(gene.getLocus())[0];
        if (interval) {
            this.props.onRegionSelected(...interval);
            this.props.handleCloseModal();
            this.props.onNewHighlight(interval.start, interval.end, gene.name);
        } else {
            notify.show("Gene not available in current region set view", "error", 2000);
        }
    };

    // UNSAFE_componentWillReceiveProps(nextProps) {
    //     this.setState( {
    //         inputValue: nextProps.transcript.replace(/\s/g, ""),
    //     } );
    //     this.input.input.focus();
    // }

    render() {
        const { color, background } = this.props;
        return (
            <GeneSearchBoxBase
                onGeneSelected={this.setViewToGene}
                simpleMode={false}
                voiceInput={true}
                color={color}
                background={background}
            />
        );
    }
}

export default GeneSearchBox;
