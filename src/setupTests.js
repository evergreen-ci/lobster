// This file is automagically executed before every test

/* global process:{} */

// Enzyme boilerplate for react
import Adapter from 'enzyme-adapter-react-15';
import Enzyme from 'enzyme';
Enzyme.configure({ adapter: new Adapter() });

// Polyfills
import 'babel-polyfill';
import 'url-search-params-polyfill';
import { LocalStorage } from 'node-localstorage';
import 'url-search-params-polyfill';
import localStorageMemory from 'localstorage-memory'

import fs from 'fs';

// Prevent us from hitting production
process.env.REACT_APP_LOGKEEPER_BASE = 'http://domain.invalid';
process.env.REACT_APP_EVERGREEN_BASE = 'http://domain.invalid';

if (!global.window) {
  global.window = {};
} else if (!global.window.localStorage) {
  if (!fs.existsSync(__dirname + '/build')) {
    fs.mkdirSync(__dirname + '/build');
    fs.mkdirSync(__dirname + '/build/localStorageTemp');
  }
  /* global global:{} */
  global.localStorage = localStorageMemory;
  global.window.localStorage = global.localStorage;
  global.window.localStorage.clear();
}

// Skip end-to-end tests by default
global.e2e = test.skip;
if (process.env.LOBSTER_E2E_SERVER_PORT) {
  process.env.LOBSTER_E2E_SERVER_PORT = parseInt(process.env.LOBSTER_E2E_SERVER_PORT, 10);
  global.e2e = (name, ...rest) => {
    return test(`e2e-${name}`, ...rest);
  };
}
