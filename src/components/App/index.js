// @flow

import React from 'react';
import { Switch, Route, BrowserRouter } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';
import './style.css';
import About from '../About';
import NotFound from '../NotFound';
import Fetch from '../Fetch';
import EvergreenLogViewer from '../Fetch/EvergreenLogViewer';
import { Nav, NavItem } from 'react-bootstrap';
import CacheModal from './CacheModal';
import LogDrop from '../LogDrop';

const logdrop = (props) => (<LogDrop {...props} />);
const logviewer = (props) => (<Fetch {...props} />);
const evergreenLogviewer = (props) => (<EvergreenLogViewer {...props} />);
const about = (props) => (<About {...props} />);
const notfound = (props) => (<NotFound {...props} />);

const Main = () => (
  <main className="lobster">
    <Switch>
      <Route exact path="/lobster/about" render={about} />
      <Route path="/lobster/build/:build/test/:test" render={logviewer} />
      <Route path="/lobster/build/:build/all" render={logviewer} />
      <Route exact path="/lobster/evergreen/task/:id/:execution/:type" render={evergreenLogviewer} />
      <Route exact path="/lobster/evergreen/test/:id" render={evergreenLogviewer} />
      <Route path="/lobster/logdrop" render={logviewer} />
      <Route path="/lobster" render={logdrop} />
      <Route path="*" render={notfound} />
    </Switch>
  </main>
);

// The Header creates links that can be used to navigate
// between routes.
const isActive = (match, location) => {
  return location.pathname.startsWith('/lobster/') && location.pathname !== '/lobster/about';
};

const never = () => false;

const Header = () => (
  <header className="head">
    <Nav bsStyle="pills">
      <LinkContainer to="/lobster/about" isActive={never}>
        <NavItem>
          <img alt="About" className="lobster-icon" src="/static/icons/lobster.ico" />
        </NavItem>
      </LinkContainer>
      <LinkContainer to="/lobster" isActive={isActive}>
        <NavItem>Viewer</NavItem>
      </LinkContainer>
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
