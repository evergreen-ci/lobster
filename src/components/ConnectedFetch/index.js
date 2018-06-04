import React from 'react';
import { StoreConnector } from 'hadron-react-components'; // eslint-disable-line no-unused-vars
import Fetch from '../Fetch'; // eslint-disable-line no-unused-vars
import store from '../../stores';
import actions from '../../actions';

class ConnectedFetch extends React.Component {
  static displayName = 'ConnectedFetch';
  render() {
    return (
      <StoreConnector store={store}>
        <Fetch actions={actions} {...this.props} />
      </StoreConnector>
    );
  }
}

export default ConnectedFetch;
export { ConnectedFetch };
