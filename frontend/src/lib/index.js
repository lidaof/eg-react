import React from 'react';
import EmbeddedContainer from '../components/EmbeddedContainer';

class Epgg extends React.Component {
        render(){
            return (
                <div>
                    <EmbeddedContainer {...this.props} />
                </div>
            );
        }
}

export default Epgg;