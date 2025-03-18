import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { Redirect } from "react-router";
import AppLayout from "./AppLayout";
import NotFoundPage from "./NotFound";
import Live from "./components/Live";
import EmbeddedContainerUI from "./components/EmbeddedContainerUI";
// import VirusGateway from "./components/VirusGateway";

const AppRouter = () => (
    <BrowserRouter basename="/browser2022">
        <React.Fragment>
            <Switch>
                <Route path="/" component={AppLayout} exact={true} />
                <Route exact path="/index.html">
                    {<Redirect to="/" />}
                </Route>
                <Route path="/live/:liveId" component={Live} exact={true} />
                <Route path="/emb" component={EmbeddedContainerUI} exact={true} />
                {/* <Route path="/virus" component={VirusGateway} exact={true} /> */}
                <Route component={NotFoundPage} />
            </Switch>
        </React.Fragment>
    </BrowserRouter>
);

export default AppRouter;
