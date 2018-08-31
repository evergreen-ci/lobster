// @flow

import React from 'react';
import { Switch, Route, BrowserRouter, Redirect, type ContextRouter } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';
import './style.css';
import About from '../About';
import NotFound from '../NotFound';
import ClusterVisualizer from '../ClusterVisualizer';
import EvergreenLogViewer from '../Fetch/EvergreenLogViewer';
import LogkeeperLogViewer from '../Fetch/LogkeeperLogViewer';
import { Nav, NavItem, NavDropdown } from 'react-bootstrap';
import CacheModal from './CacheModal';
import LogDrop from '../LogDrop';
import queryString from '../../thirdparty/query-string';

const logdrop = (props: ContextRouter) => {
  const parsed = queryString.parse(props.location.search === '' ? props.location.hash : props.location.search);
  if ('url' in parsed && 'server' in parsed) {
    return (<Redirect to={`/lobster/logdrop?${queryString.stringify(parsed)}`} />);
  }
  return (<LogDrop {...props} />);
};
const logviewer = (props) => (<LogkeeperLogViewer {...props} />);
const evergreenLogviewer = (props) => (<EvergreenLogViewer {...props} />);
const about = (props) => (<About {...props} />);
const notfound = (props) => (<NotFound {...props} />);
const visualizer = (props) => (<ClusterVisualizer {...props} />);
let visualizerPage = false;

const Main = () => (
  <main className="lobster">
    <Switch>
      <Route exact path="/lobster/about" render={about} />
      <Route exact path="/lobster/clustervis" render={visualizer} />
      <Route path="/lobster/build/:build/test/:test" render={logviewer} />
      <Route path="/lobster/build/:build/all" render={logviewer} />
      <Route exact path="/lobster/evergreen/task/:id/:execution/:type" render={evergreenLogviewer} />
      <Route exact path="/lobster/evergreen/test/:id" render={evergreenLogviewer} />
      <Route exact path="/lobster/evergreen/test/:id/:execution/:type" render={evergreenLogviewer} />
      <Route path="/lobster/logdrop" render={logviewer} />
      <Route path="/lobster" render={logdrop} />
      <Route path="*" render={notfound} />
    </Switch>
  </main>
);

// The Header creates links that can be used to navigate
// between routes.
const never = () => false;

function switchToViewer() {
  visualizerPage = false;
}

function switchToCluster() {
  visualizerPage = true;
}

const Header = () => (
  <header className="head">
    <Nav bsStyle="pills">
      <LinkContainer to="/lobster/about" isActive={never}>
        <NavItem>About</NavItem>
      </LinkContainer>
      <NavDropdown title={visualizerPage ? 'Cluster Vis' : 'Viewer'} id="nav-dropdown">
        <LinkContainer to="/lobster" isActive={never}>
          <NavItem onClick={switchToViewer}>Viewer</NavItem>
        </LinkContainer>
        <LinkContainer to="/lobster/clustervis" isActive={never}>
          <NavItem onClick={switchToCluster}>Cluster Vis</NavItem>
        </LinkContainer>
      </NavDropdown>
    </Nav>
  </header>
);

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
