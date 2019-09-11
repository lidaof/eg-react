import React from 'react';

export class NglRender extends React.PureComponent {
    constructor(props) {
        super(props);
        this.myRef = React.createRef();
        this.node = null;
        this.stage = null;
    }

    componentDidMount() {
        this.node = this.myRef.current;
        // Create NGL Stage object
        this.stage = new window.NGL.Stage(this.node, {backgroundColor: 0xffffff});
        // this.stage.viewer.renderer.setClearColor( 0xffffff, 1); // set stage backgraound to transparent
        this.stage.mouseControls.remove("hoverPick");
        // Handle window resizing
        window.addEventListener( "resize",  (event) => {
          // console.log(this.stage);
          this.stage.handleResize();
        }, false );
        this.renderStage();
    }
    
    componentDidUpdate(prevProps, prevState) {
        if(this.props.data !== prevProps.data) {
          this.renderStage();
        }
        if(prevProps.options.height !== this.props.options.height) {
            this.stage.handleResize();
        }
        if(prevProps.options.backgroundColor !== this.props.options.backgroundColor) {
            this.stage.setParameters({backgroundColor: this.props.options.backgroundColor});
        }
        
    }

    renderStage = () => {
        const {data} = this.props;
        // console.log(data)
        const blob = new Blob( [ data ], { type: 'text/plain'} ); 
        this.stage.loadFile(blob, {ext: "pdb", defaultRepresentation: true});
        // .then((o) => {
        //     o.addRepresentation("cartoon", { color: "bfactor" })
        //     o.autoView()
        // });
    }

    render() {
        const {width, height} = this.props;
        const style = {width: `${width}px`, height: `${height}px`}
        return (
            <div style={style} ref={this.myRef}></div>
        );
    }
}

