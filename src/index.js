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
import App from './components/App';
import './index.css';

const saga = createSagaMiddleware();
const store = createStore(lobster, applyMiddleware(saga));
saga.run(rootSaga);

ReactDOM.render((
  <Provider store={store}>
    <App />
  </Provider>
), document.getElementById('root'));
