import React from 'react';

/**
 * global settings for the browser
 * @author Daofeng
 */

export const AppContext = React.createContext();

export function withSettings(Component) {
   return function ConnectedComponent(props) {
        return (
            <AppContext.Consumer>
                { settings => <Component {...props} settings={settings} /> }
            </AppContext.Consumer>
        );
    };
}

export class AppSettings extends React.Component {
    state = {
        isShowing3D: false,
        isShowingNavigator: true,
        trackLabelWidth: 120,
    };

    toggleNavigator = () => {
        this.setState(prevState => {return {isShowingNavigator: !prevState.isShowingNavigator}});
    };

    toggle3DScene = () => {
        this.setState(prevState => {return {isShowing3D: !prevState.isShowing3D}});
    };

    changeLabelWidth = (type) => {
        const { trackLabelWidth } = this.state;
        let newLabelWidth;
        switch (type) {
            case 'INCREASE':
                newLabelWidth = trackLabelWidth + 5;
                break;
            case 'DECREASE':
                if( trackLabelWidth <= 60){
                    break;
                }
                newLabelWidth = trackLableWidth - 5;
                break;
            default:
                break;
        }
        this.setState({trackLableWidth: newLabelWidth});
    };

    render() {
        return (
            <AppContext.Provider value={
                {
                    ...this.state, 
                    toggleNavigator: this.toggleNavigator,
                    on3DToggle: this.toggle3DScene,
                    changeLabelWidth: this.changeLabelWidth,
                }
            }>
                {this.props.children}
            </AppContext.Provider>
        );
    }
}
