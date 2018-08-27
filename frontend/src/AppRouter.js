import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import App from './App';
import NotFoundPage from './NotFound';
import Live from './components/Live';

const AppRouter = () => (
    <BrowserRouter>
        <React.Fragment>
            <Switch>
                <Route path="/" component={App} exact={true}/>
                <Route path="/live/:liveId" component={Live} exact={true}/>
                <Route component={NotFoundPage}/>
            </Switch>
        </React.Fragment>
    </BrowserRouter>
);

export default AppRouter;
