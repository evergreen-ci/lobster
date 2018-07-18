// This file is automagically executed before every test

// Enzyme boilerplate for react
import Adapter from 'enzyme-adapter-react-15';
import Enzyme from 'enzyme';
import 'babel-polyfill';
import 'url-search-params-polyfill';
import { LocalStorage } from 'node-localstorage';
Enzyme.configure({ adapter: new Adapter() });

// Polyfills
import 'url-search-params-polyfill';

// Prevent us from hitting production
/* global process:{} */
process.env.REACT_APP_LOGKEEPER_BASE = 'http://domain.invalid';
process.env.REACT_APP_EVERGREEN_BASE = 'http://domain.invalid';

import '../node_modules/idb.filesystem.js/dist/idb.filesystem.min.js';

if (!window.localStorage) {
  /* global global:{} */
  global.localStorage = new LocalStorage('./build/localStorageTemp');
  global.window.localStorage = global.localStorage;
  global.window.localStorage.clear();
}
