import React from 'react';
import { ActionCreators as UndoActionCreators } from 'redux-undo';
import { connect } from 'react-redux';
import ReactModal from "react-modal";

import './History.css';

const MODAL_STYLE = {
    content: {
        top: "40px",
        left: "unset",
        right: "50px",
        bottom: "unset",
        overflow: "visible",
        padding: "5px",
        color: "black",
    }
};

class History extends React.Component {
    constructor () {
        super();
        this.state = {
            showModal: false
        };
        
        this.handleOpenModal = this.handleOpenModal.bind(this);
        this.handleCloseModal = this.handleCloseModal.bind(this);
        this.renderHistory = this.renderHistory.bind(this);
    }
    
    handleOpenModal() {
        this.setState({ showModal: true });
    }
      
    handleCloseModal() {
        this.setState({ showModal: false });
    }

    renderHistory() {
        const {past, future} =  this.props.state;
        if (past.length === 0 && future.length === 0) {
            return <div>No operation history yet!</div>;
        }

        const pastItems = makeItemList(past, this.props.jumpToPast);
        const futureItems = makeItemList(future, this.props.jumpToFuture);

        return (
            <div className="History">
                {past.length > 0 && <p>Go back:</p>}
                {pastItems}
                {future.length > 0 && <p>Go forward:</p>}
                {futureItems}
            </div>
        );

        function makeItemList(stateList, callback) {
            const items = stateList.map((value, index) => 
                <li key={index} onClick={() => callback(index)}>
                    <button className="btn btn-sm btn-warning">
                        Region: {value.viewRegion ? value.viewRegion.currentRegionAsString() : "(none)"}, 
                        # of tracks: {value.tracks ? value.tracks.length: 0}
                    </button>
                </li>
            );
            return <ol>{items}</ol>;
        }
    }

      render () {
        return (
          <React.Fragment>
            <button onClick={this.handleOpenModal} title="Operation history" className="btn btn-light">📗</button>
            <ReactModal 
                isOpen={this.state.showModal}
                contentLabel="History"
                ariaHideApp={false}
                onRequestClose={this.handleCloseModal}
                shouldCloseOnOverlayClick={true}
                style={MODAL_STYLE}
            >
            <div className="History">
                <h5>Operation history</h5>
                <button onClick={this.handleCloseModal} className="btn btn-sm btn-danger">Close</button>
                <button onClick={this.props.clearHistory} className="btn btn-sm btn-info">Clear History</button>
            </div>
            <div>
                {this.renderHistory()}
            </div>
            </ReactModal>
          </React.Fragment>
        );
      }
}

const mapStateToProps = (state) => {
  return {
    state: state.browser
  }
};

const mapDispatchToProps = (dispatch) => {
    return {
        jumpToPast: (index) => dispatch(UndoActionCreators.jumpToPast(index)),
        jumpToFuture: (index) => dispatch(UndoActionCreators.jumpToFuture(index)),
        clearHistory: () => dispatch(UndoActionCreators.clearHistory()),
    }
};

History = connect(
  mapStateToProps,
  mapDispatchToProps
)(History);

export default History;
