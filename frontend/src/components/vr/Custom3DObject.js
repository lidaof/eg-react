import React from 'react';
//import PropTypes from 'prop-types';

/**
 * An a-entity with custom Object3D from three.js
 * 
 * @author Silas Hsu
 */
export class Custom3DObject extends React.Component {
    static propTypes = {
        //object: PropTypes.instanceof(window.THREE.Object3D).isRequired
    };

    constructor(props) {
        super(props);
        this.entityRef = null;
    }

    setObject3D(object) {
        if (object) {
            this.entityRef.setObject3D('theObject', object);
        }
    }

    componentDidMount() {
        this.setObject3D(this.props.object);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.object !== this.props.object) {
            this.setObject3D(this.props.object);
        }
    }

    render() {
        const {object, ...otherProps} = this.props;
        if (!object) {
            return null;
        } else {
            return <a-entity ref={(node) => this.entityRef = node} {...otherProps} />;
        }
    }
}
