// This file is automagically executed before every test

/* global process:{} */
import fs from 'fs';
import path from 'path';

// Enzyme boilerplate for react
import Adapter from 'enzyme-adapter-react-15';
import Enzyme from 'enzyme';
Enzyme.configure({ adapter: new Adapter() });

// Polyfills
import 'babel-polyfill';
import 'url-search-params-polyfill';
import localStorageMemory from 'localstorage-memory';

if (!global.window) {
  global.window = {};
} else if (!global.window.localStorage) {
  if (!fs.existsSync(path.join(__dirname, '/build'))) {
    fs.mkdirSync(path.join(__dirname, '/build'));
    fs.mkdirSync(path.join(__dirname, '/build/localStorageTemp'));
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
} else {
  // Prevent us from hitting production
  process.env.REACT_APP_LOGKEEPER_BASE = 'http://domain.invalid';
  process.env.REACT_APP_EVERGREEN_BASE = 'http://domain.invalid';
}
