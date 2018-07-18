import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { Provider } from 'react-redux';
import { lobster } from './reducers';
import rootSaga from './sagas';
import App from './components/App';
import './index.css';

import 'babel-polyfill';
import 'url-search-params-polyfill';
// import 'whatwg-fetch';
// TODO: Firefox support
// import '../node_modules/idb.filesystem.js/dist/idb.filesystem.min.js';

const saga = createSagaMiddleware();
const store = createStore(lobster, applyMiddleware(saga));
saga.run(rootSaga);

ReactDOM.render((
  <Provider store={store}>
    <App />
  </Provider>
), document.getElementById('root'));

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
  window.localStorage.clear();
};
