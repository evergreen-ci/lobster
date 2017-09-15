import React from 'react';
import { Switch, Route, Link } from 'react-router-dom'
import './style.css';
import About from '../About/index.js';
import Fetch from '../Fetch/index.js';
import NotFound from '../NotFound/index.js';

const Main = () => (
  <main>
    <Switch>
      <Route exact path='/about' component={About}/>
      <Route path='/build/:build/test/:test' component={Fetch}/>
      <Route path='/build/:build/' component={Fetch}/>
      <Route exact path='/' component={Fetch}/>
      <Route path='*' component={NotFound}/>
    </Switch>
  </main>
)

// The Header creates links that can be used to navigate
// between routes.
const Header = () => (
  <header>
    <h3>Lo<del>g</del>bster</h3>
    <nav>
      <table>
      <tbody>
        <tr><td><Link to='/about'>About</Link></td><td><Link to='/'>Viewer</Link></td></tr>
      </tbody>
      </table>
    </nav>
  </header>
)

const App = () => (
  <div>
    <Header />
    <Main />
  </div>
)
export default App;
