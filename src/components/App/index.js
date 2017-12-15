import React from 'react';
import { Switch, Route, Link } from 'react-router-dom'
import './style.css';
import About from '../About/index.js';
import ConnectedFetch from '../ConnectedFetch/index.js';
import NotFound from '../NotFound/index.js';
import Nav from 'react-bootstrap/lib/Nav';
import Grid from 'react-bootstrap/lib/Grid';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import NavItem from 'react-bootstrap/lib/NavItem';

const Main = () => (
  <main>
    <Switch>
      <Route exact path='/lobster/about' component={About}/>
      <Route  path='/lobster/build/:build/test/:test' component={ConnectedFetch}/>
      <Route path='/lobster/build/:build/all' component={ConnectedFetch}/>
      <Route  exact path='/lobster/' component={ConnectedFetch}/>
      <Route path='*' component={NotFound}/>
    </Switch>
  </main>
)


const  handleSelect = (selectedKey) => {
   this.activeKey = selectedKey;
}
// The Header creates links that can be used to navigate
// between routes.
const Header = () => (
  <header className='head'>
    <Nav bsStyle="pills" activeKey={this.activeKey} onSelect={this.handleSelect}>
        <NavItem eventKey={1} href='/lobster/about'>About</NavItem>
        <NavItem eventKey={2} href='/lobster'>Viewer</NavItem>
    </Nav>
  </header>
)

/*
  <Grid>
    <Row className="show-grid">
        <Col md={12}><Header /></Col>
    </Row>
  </Grid>
 */
const App = () => (
  <div>
  <Header />
  <Main />
  </div>
)
export default App;
