import React from 'react';
//import $ from 'jquery';
//import _ from 'underscore';
import PropTypes from 'prop-types';
import axios from 'axios';
import Track from './Track';

let JSON5 = require('json5');
//let _ = require('underscore')
//let igv = require("igv/igv-beta.js");

let baseUrl = 'http://epgg-test.wustl.edu/cgi-bin/subtleKnife';
//let componentUrl = 'addtracks=on&dbName=hg19&runmode=0&regionLst=chr7,0,159138663,3360&startCoord=26733030&stopCoord=27694134&hmtk15=4407651065243017,example bigwig track,http://vizhub.wustl.edu/hubSample/hg19/GSM429321.bigWig,1,1&hmspan=1120'

class TrackContainer extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      data : null
    }
  }

  componentDidMount(){
    //let tkobj,dsp = this.props;
    axios.get(baseUrl, {
      params: {
        addtracks: 'on',
        dbName:'hg19',
        runmode:0,
        regionLst:'chr7,0,159138663,3360',
        startCoord:26733030,
        stopCoord:27694134,
        hmtk15:'4407651065243017,example bigwig track,http://vizhub.wustl.edu/hubSample/hg19/GSM429321.bigWig,1,1',
        hmspan:1120
      }
    })
    //axios.get(baseUrl+encodeURIComponent(componentUrl))
    .then(response => {
      console.log(JSON5.parse(response.data));
      this.setState({data:JSON5.parse(response.data)});
    })
    .catch(function (error) {
      console.log(error);
    });

  }

  render(){
    if(this.state.data !== null){
      return <Track data={this.state.data} />;
    }else{
      return <p>Loading...</p>;
    }
  }
}

TrackContainer.propTypes = {
  tkobj : PropTypes.object.isRequired,
  dsp   : PropTypes.object.isRequired
};

export default TrackContainer;
