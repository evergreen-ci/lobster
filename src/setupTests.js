// This file is automagically executed before every test

// Enzyme boilerplate for react
import Adapter from 'enzyme-adapter-react-15';
import Enzyme from 'enzyme';
Enzyme.configure({ adapter: new Adapter() });

// Polyfills
import 'babel-polyfill';
import 'url-search-params-polyfill';
import { LocalStorage } from 'node-localstorage';
import 'url-search-params-polyfill';

// Prevent us from hitting production
/* global process:{} */
process.env.REACT_APP_LOGKEEPER_BASE = 'http://domain.invalid';
process.env.REACT_APP_EVERGREEN_BASE = 'http://domain.invalid';

if (global.window && !global.window.localStorage) {
  /* global global:{} */
  global.localStorage = new LocalStorage('./build/localStorageTemp');
  global.window.localStorage = global.localStorage;
  global.window.localStorage.clear();
}

// Skip end-to-end tests by default
global.e2e = test.skip;
if (process.env.LOBSTER_E2E_SERVER_PORT) {
  process.env.LOBSTER_E2E_SERVER_PORT = parseInt(process.env.LOBSTER_E2E_SERVER_PORT, 10);
  global.e2e = test;
}
