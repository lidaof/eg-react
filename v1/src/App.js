import React, { Component } from 'react';
//import logo from './logo.svg';
import './App.css';
import TrackContainer from './components/TrackContainer';
import GenomeNavigator from './components/GenomeNavigator';

class App extends Component {
    render() {
        //return <TrackContainer></TrackContainer>
        return <GenomeNavigator></GenomeNavigator>;
    }
}

export default App;
