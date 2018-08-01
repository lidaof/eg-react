import React from 'react';
import PropTypes from 'prop-types';
import Drawer from 'react-motion-drawer';
import TrackManager from './components/trackManagers/TrackManager';
import RegionSetSelector from './components/RegionSetSelector';
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
        isShowing3D: PropTypes.bool,
        onTracksAdded: PropTypes.func,
        onTrackRemoved: PropTypes.func,
        on3DToggle: PropTypes.func,
    }

    constructor(props) {
        super(props);
        this.state = {
            isShowingRegionSetUI: false,
            isMenuOpen: false
        };
        this.setMenuOpen = this.setMenuOpen.bind(this);
        this.toggleRegionSetUI = this.toggleRegionSetUI.bind(this);
    }

    setMenuOpen(openState) {
        this.setState({isMenuOpen: openState});
    }

    toggleRegionSetUI() {
        this.setState(prevState => {return {isShowingRegionSetUI: !prevState.isShowingRegionSetUI}});
    }

    render() {
        const {tracks, genomeConfig, isShowing3D, onTracksAdded, onTrackRemoved, on3DToggle} = this.props;
        const {isMenuOpen, isShowingRegionSetUI} = this.state;
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
                <div>
                    <span style={{marginRight: "1ch"}} >Show region set config</span>
                    <input type="checkbox" checked={isShowingRegionSetUI} onChange={this.toggleRegionSetUI} />
                </div>
                <div>
                    <span style={{marginRight: "1ch"}} >Show 3D scene</span>
                    <input type="checkbox" checked={isShowing3D} onChange={on3DToggle} />
                </div>
                {isShowingRegionSetUI && <RegionSetSelector genome={genomeConfig.genome} />}
                <hr/>
                <TrackManager addedTracks={tracks} onTracksAdded={onTracksAdded} onTrackRemoved={onTrackRemoved} />
            </Drawer>
        </React.Fragment>
        );
    }
}
