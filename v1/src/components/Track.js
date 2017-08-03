import React from 'react';
import PropTypes from 'prop-types';

class Track extends React.Component {

  makeTrackDisplayobj=function(obj){
  // track canvas
  var c = document.createElement('canvas');
  c.height=c.width=1;
  c.style.display='block';
  c.tkname=obj.name;
  obj.canvas=c;
  if(obj.cotton) c.cotton=obj.cotton;

  // mcm canvas (hidden in splinter)
  c = document.createElement('canvas');
  c.style.display = "block";
  c.tkname=obj.name;
  c.width=c.height=1;

  obj.atC = c;
  if(obj.cotton) c.cotton=obj.cotton;

  // header canvas (hidden in splinter)
  c = document.createElement('canvas');
  c.style.display = 'block';
  c.width=c.height=1;
  c.tkname=obj.name;
  obj.header=c;
  if(obj.cotton) c.cotton=obj.cotton;

  obj.qtc['anglescale']=1;

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
