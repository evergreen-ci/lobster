import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { Provider } from 'react-redux';
import { lobster } from './reducers';
import 'babel-polyfill';
import 'url-search-params-polyfill';
import 'whatwg-fetch';
import rootSaga from './sagas';
import thunk from 'redux-thunk';
import App from './components/App';
import './index.css';

const saga = createSagaMiddleware();
const store = createStore(lobster, applyMiddleware(thunk, saga));
saga.run(rootSaga);

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
  console.error("Not implemented!");
};

window.boilLobster = () => {
  window.lobsterWipeFilesystem();
  window.lobsterWipeLocalStorage();
}
