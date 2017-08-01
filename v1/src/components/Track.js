import React from 'react';
import PropTypes from 'prop-types';

class Track extends React.Component {

  makeTrackDisplayobj=function(obj){
  // track canvas
  var c = document.createElement('canvas');
  c.height=c.width=1;
  c.style.display='block';
  c.tkname=obj.name;
  c.onmousemove=track_Mmove;
  c.onmouseout=track_Mout;
  c.oncontextmenu=menu_track_browser;
  obj.canvas=c;
  c.onclick=track_click;
  if(obj.cotton) c.cotton=obj.cotton;

  // mcm canvas (hidden in splinter)
  c = document.createElement('canvas');
  c.style.display = "block";
  c.tkname=obj.name;
  c.width=c.height=1;
  c.onmousedown=mcm_Mdown;
  c.onmouseover=mcm_Mover;
  c.onmousemove=mcm_tooltipmove;
  c.onmouseout=mcm_Mout;
  c.oncontextmenu=menu_track_mcm;
  obj.atC = c;
  if(obj.cotton) c.cotton=obj.cotton;

  // header canvas (hidden in splinter)
  c = document.createElement('canvas');
  c.style.display = 'block';
  c.width=c.height=1;
  c.tkname=obj.name;
  c.oncontextmenu=menu_track_browser;
  c.onmouseover=trackheader_Mover;
  c.onmouseout=trackheader_Mout;
  c.onmousedown=trackheader_MD;
  obj.header=c;
  if(obj.cotton) c.cotton=obj.cotton;

  obj.qtc[anglescale]=1;

  return obj;
  }


  render(){
    console.log(this.props.hmtk);
    return (
      <div>
        <ul>
          {
            Object
            .keys(this.props.hmtk)
            .map(key => <li key={key}>{key}</li>)
          }
        </ul>
      </div>
    );

  }
}


Track.propTypes = {
  hmtk   : PropTypes.object.isRequired
};

export default Track;
