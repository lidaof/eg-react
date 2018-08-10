import React from 'react';
import { connect } from "react-redux";
import { ActionCreators } from "../AppState";

class Session extends React.Component {

    saveSession = () => {
        this.props.onSaveSession(this.props.state.browser.present);
    }

    restoreSession = (status) => {
        this.props.onRestoreSession(status.data);
    }

    renderSavedSession = () => {
        if (this.props.state.browser.present.sessionStatus.length === 0){
            return;
        }
        const statusList = this.props.state.browser.present.sessionStatus.map(status => 
            <li key={status.label}>
                {status.label} ({status.date.toLocaleString()}) 
                <button className="btn btn-success btn-sm" onClick={() => this.restoreSession(status)}>Restore</button>
            </li>
        );
        return (
            <div>
                <p>Session Id: {this.props.state.browser.present.sessionId} </p>
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