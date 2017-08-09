import React from 'react';
//import logo from './logo.svg';
import { Switch, Route, Link } from 'react-router-dom'
import './style.css';
import About from '../About/index.js';
import Fetch from '../Fetch/index.js';
import NotFound from '../NotFound/index.js';

const Main = () => (
  <main>
    <Switch>
      <Route exact path='/' component={About}/>
      <Route path='/fetch' component={Fetch}/>
      <Route path='*' component={NotFound}/>
    </Switch>
  </main>
)

// The Header creates links that can be used to navigate
// between routes.
const Header = () => (
  <header>
    <h1>Lo<del>g</del>bster</h1>
    <nav>
      <table>
        <tr><td><Link to='/'>About</Link></td><td><Link to='/fetch'>Viewer</Link></td></tr>
      </table>
    </nav>
  </header>
)

/*
 *  use <Header/> <Main/> to show all components
 */
const App = () => (
  <div>
    <Header />
    <Main />
  </div>
)
export default App;
