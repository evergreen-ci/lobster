// @flow

import React from 'react';
import Fetch from '.';
import type { LogIdentity } from '../../models';
import type { ContextRouter } from 'react-router-dom';
import queryString from '../../thirdparty/query-string';

function makeLogkeeperLogID(build: ?string, test: ?string, server: ?string, file: ?string): ?LogIdentity {
  if (server != null && file != null) {
    return {
      type: 'lobster',
      server: server,
      file: file
    };
  }

  if (build == null) {
    return null;
  }

  if (test == null) {
    return {
      type: 'logkeeper',
      build: build
    };
  }

  return {
    type: 'logkeeper',
    build: build,
    test: test
  };
}

const LogkeeperLogViewer = (props: ContextRouter) => {
  const { server, url } = queryString.parse(props.location.search === '' ? props.location.hash : props.location.search);

  const { build, test } = props.match.params;
  const logID = makeLogkeeperLogID(build, test, server, url);

  return (<Fetch {...props} logIdentity={logID} />);
};

export default LogkeeperLogViewer;
