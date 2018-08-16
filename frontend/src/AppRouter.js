import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import App from './App';
import LoadSession from "./components/LoadSession";
import NotFoundPage from './NotFound';

const AppRouter = () => (
    <BrowserRouter>
        <React.Fragment>
            <Switch>
                <Route path="/" component={App} exact={true}/>
                <Route path="/session/:sessionId" component={LoadSession} exact={true}/>
                <Route component={NotFoundPage}/>
            </Switch>
        </React.Fragment>
    </BrowserRouter>
);

export default AppRouter;
