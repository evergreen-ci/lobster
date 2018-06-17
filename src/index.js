import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { Provider } from 'react-redux';
import { lobster } from './reducers';
import 'babel-polyfill';
import 'url-search-params-polyfill';
import rootSaga from './sagas';

import './index.css';

import App from './components/App';

const saga = createSagaMiddleware()
const store = createStore(lobster, applyMiddleware(saga));
saga.run(rootSaga);

ReactDOM.render((
  <Provider store={store}>
    <App />
  </Provider>
), document.getElementById('root'));
