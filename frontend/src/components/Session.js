import React from 'react';
import { connect } from "react-redux";
import { ActionCreators } from "../AppState";
import base from "../base";
import { getFunName } from '../helper';
import './Session.css';

class Session extends React.Component {

    state = {
        sessionData: null,
        statusLabel: '',
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
        if(!this.state.sessionStatus){
            this.warningBox();
        }
        this.props.onSaveSession([this.props.state.browser.present, this.state.statusLabel]);
        this.setState({sessionData: this.props.state.browser.present});
    }

    restoreSession = (status) => {
        this.props.onRestoreSession(status.data);
        this.setState({sessionData: this.props.state.browser.present});
    }

    renderSavedSession = () => {
        const {sessionId, sessionStatus, restoredFrom} = this.props.state.browser.present;
        if (sessionStatus.length === 0){
            return;
        }
        let restoreClass = "btn btn-success btn-sm";
        const statusList = sessionStatus.map(status => {
            if (restoredFrom === this.state.sessionData.restoredFrom) {
                restoreClass += " disabled";
            }
            return <li key={status.label}>
                {status.label} ({status.date.toLocaleString()}) 
                <button className={restoreClass} onClick={() => this.restoreSession(status)}>Restore</button>
            </li>
        }    
        );
        return (
            <div>
                <p>Session Id: {sessionId} </p>
                <p>Saved status:</p>
                <ol>
                    {statusList}
                </ol>
            </div>
        );
    }

    warningBox = () => {
        return <div className="alert alert-warning alert-dismissible fade show" role="alert">
        <strong>No status name!</strong> You should provide a name or using the random names.
        <button type="button" className="close" data-dismiss="alert" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>;
    }

    render() {
       return (
           <div>
               <button className="btn btn-primary" onClick={this.saveSession}>Save session</button>
               <label htmlFor="statusLabel">
                Name your status: <input type="text" value={this.state.statusLabel} onChange={this.handleChange} /> or use a 
                <button type="button" className="btn btn-warning btn-sm" onClick={this.setRandomLabel}>Random</button> name
               </label>
               
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