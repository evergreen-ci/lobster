import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { Provider } from 'react-redux';
import { lobster } from './reducers';
import rootSaga from './sagas';
import thunk from 'redux-thunk';
import App from './components/App';
import { setupCache } from './actions';
import './index.css';

import 'babel-polyfill';
import 'url-search-params-polyfill';
import 'whatwg-fetch';
// Y U NO HAVE SANE BUILD?!
import '../node_modules/idb.filesystem.js/dist/idb.filesystem.min.js';
window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
window.resolveLocalFileSystemURL = window.resolveLocalFileSystemURL ||
  window.webkitResolveLocalFileSystemURL;

if (!window.requestFileSystem) {
  console.log('No FileSystem API available. Lobster will NOT cache');
}

const saga = createSagaMiddleware();
const store = createStore(lobster, applyMiddleware(thunk, saga));
saga.run(rootSaga);

const cacheStatus = window.localStorage.getItem('lobster-cache-status');
if (cacheStatus === 'ok') {
  const size = parseInt(window.localStorage.getItem('lobster-cache-size'), 10);
  if (size > 0) {
    setupCache(cacheStatus, size)(store.dispatch);
  }
}

ReactDOM.render((
  <Provider store={store}>
    <App />
  </Provider>
), document.getElementById('root'));

window.lobsterWipeLocalStorage = () => {
  window.localStorage.removeItem('lobster-cache-status');
  window.localStorage.removeItem('lobster-cache-size');
};

window.lobsterWipeFilesystem = () => {
  if (window.lobsterCage) {
    window.lobsterCage.root.removeRecursively(() => console.log('Wiped Lobster FS'),
      (err) => console.error(`Failed to wipe Lobster FileSystem: ${err}`));
  } else {
    console.log('No fs handle to clear');
  }
};

window.boilLobster = () => {
  window.lobsterWipeFilesystem();
  window.lobsterWipeLocalStorage();
};
