// This file is automagically executed before every test

import fs from "fs";
import path from "path";

// Enzyme boilerplate for react
import Adapter from "enzyme-adapter-react-16";
import Enzyme from "enzyme";

// Polyfills
import "babel-polyfill";
import "url-search-params-polyfill";
import localStorageMemory from "localstorage-memory";

Enzyme.configure({ adapter: new Adapter() });

if (!global.window) {
  global.window = {};
} else if (!global.window.localStorage) {
  if (!fs.existsSync(path.join(__dirname, "/build"))) {
    fs.mkdirSync(path.join(__dirname, "/build"));
    fs.mkdirSync(path.join(__dirname, "/build/localStorageTemp"));
  }
  /* global global:{} */
  global.localStorage = localStorageMemory;
  global.window.localStorage = global.localStorage;
  global.window.localStorage.clear();
}

// Skip end-to-end tests by default
const skip = (name, ...tail) => {
  return test.skip(`e2e-${name}`, ...tail);
};

global.e2e = skip;
global.e2eChrome = skip;
if (process.env.LOBSTER_E2E_SERVER_PORT) {
  const envDeadline = process.env.CI === "true" ? 120000 : 30000;
  process.env.LOBSTER_E2E_SERVER_PORT = parseInt(
    process.env.LOBSTER_E2E_SERVER_PORT,
    10
  );
  global.e2e = (name, f, deadline, ...tail) => {
    return test(`e2e-${name}`, f, deadline || envDeadline, ...tail);
  };

  if (
    process.env.LOBSTER_E2E_BROWSER === "chrome" ||
    process.env.LOBSTER_E2E_BROWSER === undefined
  ) {
    global.e2eChrome = (name, f, deadline, ...tail) => {
      return test(`e2e-${name}`, f, deadline || envDeadline, ...tail);
    };
  }
} else {
  // Prevent us from hitting production
  process.env.REACT_APP_LOGKEEPER_BASE = "http://domain.invalid";
  process.env.REACT_APP_EVERGREEN_BASE = "http://evergreen.invalid";
}
