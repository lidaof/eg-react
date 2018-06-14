import React from 'react';
import AnnotationTrack from '../commonComponents/annotation/AnnotationTrack';

class BamTrack extends React.Component {
    renderAnnotation() {
        return null;
    }

    render() {
        return <AnnotationTrack
            {...this.props}
            data={this.props.data}
            rowHeight={30}
            getAnnotationElement={this.renderAnnotation}
        />;
    }
}

export default BamTrack;
