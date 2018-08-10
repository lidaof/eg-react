import React from 'react';
import uuid from "uuid";
import { getFunName } from "../helper";
import { connect } from "react-redux";

const sessionId = uuid.v1()

class Session extends React.Component {

    state = {
        status: [], // list of object: {id: 0,1,2, date: Date(), label: fun name, data: {the history state}}
    };

    saveSession = () => {
        const newStatus = {
            id: this.state.length,
            date: Date(),
            label: getFunName(),
            data: this.props.state,
        };
        const status = [...this.state.status, newStatus];
        this.setState({status});
    }

    restoreSession = (status) => {
        return
    }

    renderSavedSession = () => {
        if (this.state.status === 0){
            return;
        }
        const statusList = this.state.status.map(status => 
            <li key={status.id}>
                {status.label} ({status.date}) <button className="btn btn-success btn-sm">Restore</button>
            </li>
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


export default connect(mapStateToProps)(Session);