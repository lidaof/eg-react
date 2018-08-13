import React from 'react';
import { connect } from "react-redux";
import { ActionCreators } from "../AppState";
import base from "../base";
import { getFunName } from '../helper';
import './Session.css';
import { notify } from 'react-notify-toast';
class Session extends React.Component {

    state = {
        sessionData: null,
        statusLabel: getFunName(),
    };

    // componentDidMount() {
    //     this.setState({sessionData: this.props.state.browser.present});
    //     this.ref = base.syncState(`sessions/${this.props.state.browser.present.sessionId}`,
    //         {
    //             context: this,
    //             state: 'sessionData'
    //         }
    //     );
    // }

    // componentWillUnmount() {
    //     base.removeBinding(this.ref);
    // }

    handleChange = (event) => {
        this.setState({statusLabel: event.target.value});
    }

    setRandomLabel = () => {
        this.setState({statusLabel: getFunName()});
    }

    saveSession = () => {
        this.props.onSaveSession([this.props.state.browser.present, this.state.statusLabel]);
        this.setState({sessionData: this.props.state.browser.present});
        notify.show('Session Saved!', 'success', 2000);
    }

    restoreSession = (status) => {
        this.props.onRestoreSession(status.data);
        this.setState({sessionData: this.props.state.browser.present});
        notify.show('Session Restored!', 'success', 2000);
        this.renderSavedSession();
    }

    renderSavedSession = () => {
        const {sessionId, sessionStatus, statusDate} = this.props.state.browser.present;
        if (sessionStatus.length === 0){
            return;
        }
        let restoreButton;
        const statusList = sessionStatus.map((status,i) => {
            if (statusDate.valueOf() === status.date.valueOf()) {
                restoreButton = <button className="btn btn-secondary btn-sm" disabled>
                    Restored
                </button>
            } else {
                restoreButton = <button className="btn btn-success btn-sm" 
                    onClick={() => this.restoreSession(status)}>
                    Restore
                </button>
            }
            return <li key={i}>
                {status.label} ({status.date.toLocaleString()}) 
                {restoreButton}
            </li>
        }    
        );

        
        return (
            <div>
                <p className="lead">Session Id: {sessionId} </p>
                <p>Saved status:</p>
                <ol>
                    {statusList}
                </ol>
            </div>
        );
    }

    render() {
       return (
           <div>
               <button className="btn btn-primary" onClick={this.saveSession}>Save session</button>
               <div>
                <label htmlFor="statusLabel">
                    Name your status: <input type="text" value={this.state.statusLabel} onChange={this.handleChange} 
                        size="30"
                    /> or use a 
                    <button type="button" className="btn btn-warning btn-sm" onClick={this.setRandomLabel}>
                    Random</button> name
                </label>
               </div>
               {this.renderSavedSession()}
           </div>
       );
    }
}

const mapStateToProps = (state) => {
    return {state: state};
}

const mapDispathToProps = {
    onSaveSession: ActionCreators.saveSession,
    onRestoreSession: ActionCreators.restoreRession,
};

export default connect(mapStateToProps, mapDispathToProps)(Session);