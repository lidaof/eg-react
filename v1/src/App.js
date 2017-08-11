import React, { Component } from 'react';
//import logo from './logo.svg';
import './App.css';
import TrackContainer from './components/TrackContainer';
import GenomeNavigatorReact from './components/GenomeNavigatorReact';

class App extends Component {
    render() {
        //return <TrackContainer></TrackContainer>
        return <GenomeNavigatorReact></GenomeNavigatorReact>;
    }
}

export default App;
