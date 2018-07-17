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
  },
  location: {
    hash: string
  }
}

const lineRegex = new RegExp('#L([0-9]+)');

const EvergreenLogViewer = (props: Props) => {
  const newProps = {...props};
  const matches = lineRegex.exec(newProps.location.hash);
  if (matches && matches.length > 1) {
    const line = matches[1];
    newProps.location.hash = `#scroll=${line}&bookmarks=${line}`;
  }
  const { id, execution, type } = props.match.params;
  let action;
  if (execution !== undefined && type !== undefined) {
    action = () => actions.evergreenLoadTaskLog(id, execution, type);
  } else {
    action = () => actions.evergreenLoadTestLog(id);
  }
  return (<Fetch {...newProps} action={action} />);
};

export default EvergreenLogViewer;
