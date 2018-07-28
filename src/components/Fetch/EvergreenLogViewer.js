// @flow

import React from 'react';
import Fetch from '.';
import { stringToEvergreenTaskLogType, type LogIdentity } from '../../models';
import type { ContextRouter } from 'react-router-dom';

type Props = ContextRouter

function makeEvergreenLogID(id: ?string, type: ?string, execution: ?string): ?LogIdentity {
  if (id == null) {
    return null;
  }

  if (type != null) {
    const logType = stringToEvergreenTaskLogType(type);
    if (logType == null) {
      return null;
    }
    return {
      type: 'evergreen-task',
      id: id,
      execution: parseInt(execution, 10) || 0,
      log: logType
    };
  }

  return {
    type: 'evergreen-test',
    id: id
  };
}

const EvergreenLogViewer = (props: Props) => {
  const lineRegex = new RegExp('#L([0-9]+)$');

  const newProps = {};
  const matches = lineRegex.exec(props.location.hash);
  if (matches && matches.length > 1) {
    const line = matches[1];
    newProps.location = {
      hash: `#scroll=${line}&bookmarks=${line}`
    };
  }
  const { id, type, execution } = props.match.params;
  const logID = makeEvergreenLogID(id, type, execution);

  return (<Fetch {...props} {...newProps} logIdentity={logID} />);
};

export default EvergreenLogViewer;
