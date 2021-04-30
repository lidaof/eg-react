import React from 'react';
import reactCSS from 'reactcss'
import { SketchPicker } from 'react-color';
import colorParse from 'color-parse';

export class ColorPicker extends React.Component {
    
    static defaultProps = {
        label: '',
    };

    constructor(props){
        super(props)
        const parsed = colorParse(props.initColor);
        this.state = {
            displayColorPicker: false,
            color: {
              r: parsed.values[0],
              g: parsed.values[1],
              b: parsed.values[2],
              a: parsed.alpha,
            },
          };
    }
    
      handleClick = () => {
        this.setState({ displayColorPicker: !this.state.displayColorPicker })
      };
    
      handleClose = () => {
        this.setState({ displayColorPicker: false })
      };
    
      handleChange = (color) => {
        this.setState({ color: color.rgb })
        const {onUpdateLegendColor, colorKey} = this.props;
        onUpdateLegendColor(colorKey, color.hex)
      };
    
      render() {
    
        const styles = reactCSS({
          'default': {
            color: {
              width: '24px',
              height: '24px',
              borderRadius: '2px',
              background: `rgba(${ this.state.color.r }, ${ this.state.color.g }, ${ this.state.color.b }, ${ this.state.color.a })`,
            },
            swatch: {
              padding: '5px',
              background: '#fff',
              borderRadius: '1px',
            //   boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
              display: 'inline-block',
              cursor: 'pointer',
            },
            popover: {
              position: 'absolute',
              zIndex: '2',
              display: 'inline-block',
            },
            cover: {
              position: 'fixed',
              top: '0px',
              right: '0px',
              bottom: '0px',
              left: '0px',
            },
          },
        });
    
        return (
          <div>
            <div style={ styles.swatch } onClick={ this.handleClick }>
              <div style={ styles.color } >{this.props.label}</div>
            </div>
            { this.state.displayColorPicker ? <div style={ styles.popover }>
              <div style={ styles.cover } onClick={ this.handleClose }/>
              <SketchPicker color={ this.state.color } onChangeComplete={ this.handleChange } />
            </div> : null }
    
          </div>
        )
      }
}