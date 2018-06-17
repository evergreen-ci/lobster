import React from 'react';
import ReactDOM from 'react-dom';
import Actions from './actions';
import 'babel-polyfill';
import 'url-search-params-polyfill';

import './index.css';

import App from './components/App';

ReactDOM.render((
  <App Actions={Actions} {...this.props} />
), document.getElementById('root'));
