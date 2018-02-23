import PropTypes from 'prop-types';
import React from 'react';

const STYLE = {
    width: 250,
    height: 150,
};

/**
 * Box that contains gene details when a gene annotation is clicked.
 * 
 * @author Silas Hsu
 */
class GeneDetail extends React.Component {
    static propTypes = {
        gene: PropTypes.object.isRequired, // The Gene object for which to display info
    };

    constructor(props) {
        super(props);
        this.state = {
            description: "Loading..."
        };
        props.gene.getDescription().then(
            description => this.setState({description: description})
        );
    }

    render() {
        return <div style={STYLE} >{this.props.gene.getName()}
            <div>{this.state.description || "(no data)"}</div>
        </div>;
    }
}

export default GeneDetail;
