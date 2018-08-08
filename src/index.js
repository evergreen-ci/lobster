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
import './index.css';

import 'babel-polyfill';
import 'url-search-params-polyfill';
import 'whatwg-fetch';
// TODO: maybe Firefox support?
// import '../node_modules/idb.filesystem.js/dist/idb.filesystem.min.js';

const saga = createSagaMiddleware();
const store = createStore(lobster, applyMiddleware(saga));
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
