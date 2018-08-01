import React from "react";
import withCurrentGenome from './withCurrentGenome';
import { getGenomeInfo } from "../model/genomes/allGenomes";

import TrackRegionController from './genomeNavigator/TrackRegionController';

import eglogo from '../images/eglogo.jpg';

import './Nav.css';

/**
 * the top navigation bar for browser
 * @author Daofeng Li
 */
class Nav extends React.Component {
    render() {
        const {genomeConfig} = this.props;
        const genomeName = genomeConfig.genome.getName();
        const {name, logo, color} = getGenomeInfo(genomeName)
        return (
            <div className="Nav-container">
                <div>
                    <img src={eglogo} width="300px" alt="browser logo"/>
                </div>
                <div className="Nav-genome Nav-center" 
                    style={{backgroundImage: `url(${logo})`, color: color, backgroundSize: "cover"}}>
                    <div><span style={{textTransform: 'capitalize'}}>{name}</span> {genomeName}</div>
                </div>
                <div className="Nav-center">
                    <TrackRegionController
                        selectedRegion={this.props.selectedRegion}
                        onRegionSelected={this.props.onRegionSelected}
                    />
                </div>
                <div className="Nav-center btn-group">
                    <button type="button" className="btn btn-primary btn-sm dropdown-toggle" 
                        data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">🎹Tracks</button>
                    <div className="dropdown-menu">
                        <a className="dropdown-item" href="#">Track Facet Table</a>
                    </div>
                </div>
                <div className="Nav-center">
                    <button type="button" className="btn btn-success btn-sm">🔧Apps</button>
                </div>
                <div className="Nav-center">
                    <button type="button" className="btn btn-info btn-sm">⚙Settings</button>
                </div>
                <div className="Nav-center">
                    <button type="button" className="btn btn-warning btn-sm">📖Documentation</button>
                </div>
                <div></div>
            </div>
        )
    }
}

export default withCurrentGenome(Nav);