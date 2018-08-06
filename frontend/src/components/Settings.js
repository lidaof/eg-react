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
    };

    toggleNavigator = () => {
        this.setState(prevState => {return {isShowingNavigator: !prevState.isShowingNavigator}});
        //this.setState(state => ({ isShowingNavigator: !state.isShowingNavigator }));
    };

    toggle3DScene = () => {
        this.setState(prevState => {return {isShowing3D: !prevState.isShowing3D}});
    };

    render() {
        return (
            <AppContext.Provider value={
                {
                    ...this.state, 
                    toggleNavigator: this.toggleNavigator,
                    on3DToggle: this.toggle3DScene,
                }
            }>
                {this.props.children}
            </AppContext.Provider>
        );
    }
}
