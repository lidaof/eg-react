import React from 'react';

export class NglRender extends React.PureComponent {
    constructor(props) {
        super(props);
        this.myRef = React.createRef();
        this.node = null;
        this.stage = null;
    }

    componentDidMount() {
        // const {backgroundColor} = this.props.options;
        const backgroundColor = 'pink';
        this.node = this.myRef.current;
        // Create NGL Stage object
        this.stage = new window.NGL.Stage(this.node, {backgroundColor});
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
    }

    renderStage = () => {
        const {data} = this.props;
        // console.log(data)
        const blob = new Blob( [ data ], { type: 'text/plain'} ); 
        this.stage.loadFile(blob, {ext: "pdb", defaultRepresentation: true})
        .then((o) => {
            o.addRepresentation("cartoon", { color: "bfactor" })
            o.autoView()
        });
    }

    render() {
        const {width, height} = this.props;
        const style = {width: `${width}px`, height: `${height}px`}
        return (
            <div style={style} ref={this.myRef}></div>
        );
    }
}

