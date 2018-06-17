import React from 'react';
import { Switch, Route, BrowserRouter } from 'react-router-dom';
import './style.css';
import About from '../About/index.js';
import ConnectedFetch from '../ConnectedFetch/index.js';
import NotFound from '../NotFound/index.js';
import Nav from 'react-bootstrap/lib/Nav';
import NavItem from 'react-bootstrap/lib/NavItem';

const Main = () => (
  <main>
    <Switch>
      <Route exact path="/lobster/about" component={About} />
      <Route path="/lobster/build/:build/test/:test" component={ConnectedFetch} />
      <Route path="/lobster/build/:build/all" component={ConnectedFetch} />
      <Route exact path="/lobster/" component={ConnectedFetch} />
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
      <Header />
      <Main />
    </div>
  </BrowserRouter>
);

export default App;
