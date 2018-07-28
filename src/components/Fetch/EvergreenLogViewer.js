// @flow

import React from 'react';
import Fetch from '.';
import * as actions from '../../actions';
import { stringToEvergreenTaskLogType } from '../../models';

type Props = {
  match: {
    params: {
      id?: ?string,
      execution?: ?string,
      type?: ?string,
      [key: string]: ?string
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
  if (id) {
    if (execution != null && type != null) {
      const logType = stringToEvergreenTaskLogType(type);
      if (logType) {
        action = () => actions.evergreenLoadTaskLog(id, parseInt(execution, 10), logType);
      }
    } else {
      action = () => actions.evergreenLoadTestLog(id);
    }
  }
  return (<Fetch {...props} {...newProps} action={action} />);
};

export default EvergreenLogViewer;
