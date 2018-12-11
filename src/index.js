// @flow

import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { Provider } from 'react-redux';
import { lobster } from './reducers';
import rootSaga from './sagas';
import urlParse from './sagas/urlParse';
import { wipeCache } from './sagas/lobstercage';
import App from './components/App';
import { logger } from 'redux-logger';
import { isProd } from './config';
import './index.css';

// Polyfills
import 'babel-polyfill';
import 'url-search-params-polyfill';
import 'whatwg-fetch';
// TODO: maybe Firefox support?
// import '../node_modules/idb.filesystem.js/dist/idb.filesystem.min.js';

const saga = createSagaMiddleware();
const middlewares = [saga];
if (!isProd) {
  (function(l: any){})(logger)
  //middlewares.push(logger);
}

const store = createStore(lobster, applyMiddleware(...middlewares));
saga.run(urlParse);
saga.run(rootSaga);

const root = document.getElementById('root');
if (root) {
  ReactDOM.render((
    <Provider store={store}>
      <App />
    </Provider>
  ), root);
}

window.lobsterWipeFilesystem = () => {
  saga.run(wipeCache);
};

window.boilLobster = () => {
  window.lobsterWipeFilesystem();
  window.localStorage.clear();
};

window.addEventListener('hashchange', () => saga.run(urlParse), false);
