import React, { Component } from 'react';
//import logo from './logo.svg';
import './App.css';
import TrackContainer from './components/TrackContainer';

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      dsp:{
        chr: 'chr7',
        start:27173534,
        stop:27253626
      }
    };
  }
  render() {
    let tkobj = {
      type:'bigWig',
      label:'example bigwig track',
      url:'http://vizhub.wustl.edu/hubSample/hg19/GSM429321.bigWig'
    };
    return (
      <TrackContainer tkobj={tkobj} dsp={this.state.dsp} />
    );
  }
}

export default App;
