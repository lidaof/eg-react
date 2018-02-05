import React from 'react';
import PropTypes from 'prop-types';

/**
 * An a-entity with custom Object3D from three.js
 * 
 * @author Silas Hsu
 */
class Custom3DObject extends React.Component {
    static propTypes = {
        //object3D: PropTypes.instanceof(window.THREE.Object3D).isRequired
    };

    constructor(props) {
        super(props);
        this.entityRef = null;
    }

    componentDidMount() {
        this.entityRef.setObject3D('theObject', this.props.object3D);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.object3D !== this.props.object3D) {
            this.entityRef.setObject3D('theObject', this.props.object3D);
        }
    }

    render() {
        let {object3D, ...otherProps} = this.props;
        return <a-entity ref={(node) => this.entityRef = node} {...otherProps} />;
    }
}

export default Custom3DObject;
