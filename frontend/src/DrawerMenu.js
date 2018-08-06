import React from 'react';
import PropTypes from 'prop-types';
import Drawer from 'react-motion-drawer';
import TrackManager from './components/trackManagers/TrackManager';
import { TrackModel } from './model/TrackModel';

import './DrawerMenu.css';

const DRAWER_STYLE = {
    padding: 5,
    background: "#F9F9F9",
    boxShadow: "rgba(0, 0, 0, 0.188235) 0px 10px 20px, rgba(0, 0, 0, 0.227451) 0px 6px 6px"
};

export class DrawerMenu extends React.Component {
    static propTypes = {
        tracks: PropTypes.arrayOf(PropTypes.instanceOf(TrackModel)),
        genomeConfig: PropTypes.object.isRequired,
        onTracksAdded: PropTypes.func,
        onTrackRemoved: PropTypes.func,
    }

    constructor(props) {
        super(props);
        this.state = {
            isMenuOpen: false
        };
        this.setMenuOpen = this.setMenuOpen.bind(this);
    }

    setMenuOpen(openState) {
        this.setState({isMenuOpen: openState});
    }


    render() {
        const {tracks, genomeConfig, onTracksAdded, onTrackRemoved} = this.props;
        const {isMenuOpen} = this.state;
        return (
        <React.Fragment>
            <div className="DrawerMenu-open-button" onClick={() => this.setMenuOpen(true)} >☰</div>
            <Drawer
                onChange={this.setMenuOpen}
                open={isMenuOpen}
                width="100vw"
                overlayColor="rgba(255,255,255,0.6)"
                drawerStyle={DRAWER_STYLE} 
                fadeOut={true}
                zIndex={1}
                noTouchOpen={true}
                noTouchClose={true}
            >
                <div
                    title="Close menu"
                    className="DrawerMenu-close-button"
                    onClick={() => this.setMenuOpen(false)}
                >
                    ✘
                </div>
                <hr/>
                <TrackManager addedTracks={tracks} onTracksAdded={onTracksAdded} onTrackRemoved={onTrackRemoved} />
            </Drawer>
        </React.Fragment>
        );
    }
}
