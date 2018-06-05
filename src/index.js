import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { StoreConnector } from 'hadron-react-components';
import {LobsterStore} from './stores';
import Actions from './actions';

import './index.css';

import App from './components/App';

ReactDOM.render((
  <BrowserRouter>
    <StoreConnector store={LobsterStore}>
      <App Actions={Actions} {...this.props} />
    </StoreConnector>
  </BrowserRouter>
), document.getElementById('root'));
