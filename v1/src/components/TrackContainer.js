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
      hmtk:{}, //key: name from randomKey, value: track object
      decorInfo:{}
    };
    this.randomKey = this.randomKey.bind(this);
  }

  componentDidMount(){
    let {tkobj,dsp} = this.props;
    let tkKey = this.randomKey();
    axios.get(baseUrl, {
      params: {
        addtracks: 'on',
        dbName:'hg19',
        runmode:0,
        regionLst:'chr7,0,159138663,3360',
        startCoord:dsp.start,
        stopCoord:dsp.stop,
        hmtk15:`${tkKey},${tkobj.label},${tkobj.url},1,1`,
        hmspan:1120
      }
    })
    //axios.get(baseUrl+encodeURIComponent(componentUrl))
    .then(response => {
      let x = JSON5.parse(response.data);
      console.log(x);
      let hmtk = {...this.state.hmtk};
      hmtk[tkKey] = {
        data:x.tkdatalst[0].data,
        name:x.tkdatalst[0].name,
        url:x.tkdatalst[0].url,
        label:x.tkdatalst[0].label,
        ft:x.tkdatalst[0].ft,
        mode:'show',
        qtc:{height:40}
      };
      this.setState({hmtk});
    })
    .catch(function (error) {
      console.log(error);
    });

  }

  randomKey(){
    var n = Math.random().toString().split('.')[1];
    while((n in this.state.hmtk) || (n in this.state.decorInfo))
    	n = Math.random().toString().split('.')[1];
    return n;
  }


  render(){
    if(this.state.hmtk){
      console.log(this.state.hmtk );
      return <Track hmtk={this.state.hmtk} />;
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
