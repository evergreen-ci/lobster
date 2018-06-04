import ReactDOM from 'react-dom';
import {LobsterStore} from './stores';
import Actions from './actions';

import './index.css';


ReactDOM.render((
  <BrowserRouter>
    <StoreConnector store={LobsterStore}>
      <App Actions={Actions} {...this.props} />
    </StoreConnector>
  </BrowserRouter>
), document.getElementById('root'));
