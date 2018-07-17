// @flow

import React from 'react';
import { Switch, Route, BrowserRouter } from 'react-router-dom';
import './style.css';
import About from '../About';
import NotFound from '../NotFound';
import Fetch from '../Fetch';
import EvergreenLogViewer from '../Fetch/EvergreenLogViewer';
import { Nav, NavItem } from 'react-bootstrap';
import CacheModal from './CacheModal';

const logviewer = (props) => (<Fetch {...props} />);
const evergreenLogviewer = (props) => (<EvergreenLogViewer {...props} />);

const Main = () => (
  <main>
    <Switch>
      <Route exact path="/lobster/about" component={About} />
      <Route path="/lobster/build/:build/test/:test" render={logviewer} />
      <Route path="/lobster/build/:build/all" render={logviewer} />
      <Route exact path="/lobster/evergreen/task/:id/:execution/:type" render={evergreenLogviewer} />
      <Route exact path="/lobster/evergreen/test/:id" render={evergreenLogviewer} />
      <Route exact path="/lobster/" render={logviewer} />
      <Route path="*" component={NotFound} />
    </Switch>
  </main>
);

// The Header creates links that can be used to navigate
// between routes.
const Header = () => (
  <header className="head">
    <Nav bsStyle="pills">
      <NavItem eventKey={1} href="/lobster/about">About</NavItem>
      <NavItem eventKey={2} href="/lobster">Viewer</NavItem>
    </Nav>
  </header>
);


/*
  <Grid>
    <Row className="show-grid">
        <Col md={12}><Header /></Col>
    </Row>
  </Grid>
 */
const App = () => (
  <BrowserRouter>
    <div>
      <CacheModal />
      <Header />
      <Main />
    </div>
  </BrowserRouter>
);

export default App;
