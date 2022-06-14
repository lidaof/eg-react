import React from "react";
import { connect } from "react-redux";
import _ from "lodash";
import Switch from "react-switch";
import { ActionCreators } from "../AppState";
import "./DarkMode.css";

interface MapStateToPropsProps {
    browser: {
        present: {
            darkTheme: boolean;
        }
    }
}

function mapStateToProps(state: MapStateToPropsProps) {
    return {
        darkTheme: state.browser.present.darkTheme,
    };
}

const callbacks = {
    onSetDarkTheme: ActionCreators.setDarkTheme,
};

interface ThemeProps {
    onSetDarkTheme: (darkTheme: boolean) => void;
    darkTheme: boolean;
}

class DarkMode extends React.Component<ThemeProps, null> {
    constructor(props: ThemeProps) {
        super(props);
        this.toggleTheme = _.debounce(this.toggleTheme, 100);
    }
    toggleTheme = () => {
        this.props.onSetDarkTheme(!this.props.darkTheme);
    }
    render(): React.ReactNode {
        return <Switch onChange={this.toggleTheme} checked={!this.props.darkTheme} className="darkToggleBox"
            offColor='#505050'
            onHandleColor='#505050'
            onColor="#ecedf0"
            offHandleColor="#ecedf0"
            uncheckedIcon={
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100%",
                        fontSize: 18
                    }}
                >
                    <span role="img" aria-label="dark mode">🌙</span>

                </div>
            }
            checkedIcon={
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100%",
                        fontSize: 18
                    }}
                >
                    <span role="img" aria-label="light mode">🔆</span>

                </div>
            } />
    }
}

const withDarkTheme = connect(mapStateToProps, callbacks);
export default withDarkTheme(DarkMode);