// @flow

import React from 'react';
import Fetch from '.';
import * as actions from '../../actions';

type Props = {
  match: {
    params: {
      id: string,
      execution?: number,
      type?: string
    }
  },
  location: {
    hash: string
  }
}

const EvergreenLogViewer = (props: Props) => {
  const lineRegex = new RegExp('#L([0-9]+)');

  const newProps = {};
  const matches = lineRegex.exec(props.location.hash);
  if (matches && matches.length > 1) {
    const line = matches[1];
    newProps.location = {
      hash: `#scroll=${line}&bookmarks=${line}`
    };
  }
  const { id, execution, type } = props.match.params;
  let action;
  if (execution !== undefined && type !== undefined) {
    const logType = actions.stringToEvergreenTaskLogType(type);
    if (logType) {
      action = () => actions.evergreenLoadTaskLog(id, execution, logType);
    }
  } else {
    action = () => actions.evergreenLoadTestLog(id);
  }
  return (<Fetch {...props} {...newProps} action={action} />);
};

export default EvergreenLogViewer;
