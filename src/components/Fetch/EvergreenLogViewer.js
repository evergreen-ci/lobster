// @flow

import React from 'react';
import Fetch from '.';
import * as actions from '../../actions';

type Props = {
  match: {
    params: {
      id: string,
      execution?: number,
      type?: actions.EvergreenTaskLogType
    }
  }
}

const EvergreenLogViewer = (props: Props) => {
  const { id, execution, type } = props.match.params;
  let action;
  if (execution !== undefined && type !== undefined) {
    action = () => actions.evergreenLoadTaskLog(id, execution, type);
  } else {
    action = () => actions.evergreenLoadTestLog(id);
  }
  return (<Fetch {...props} action={action} />);
};

export default EvergreenLogViewer;
