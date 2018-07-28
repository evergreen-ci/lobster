// @flow

import React from 'react';
import Fetch from '.';
import type { LogIdentity } from '../../models';
import type { ContextRouter } from 'react-router-dom';
import queryString from '../../thirdparty/query-string';

type Props = ContextRouter

function makeLogkeeperLogID(build: ?string, test: ?string, server: ?string, file: ?string): ?LogIdentity {
  if (build == null) {
    return null;
  }

  if (server != null && file != null) {
    return {
      type: 'lobster',
      server: server,
      file: file
    };
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

const LogkeeperLogViewer = (props: Props) => {
  const lineRegex = new RegExp('#L([0-9]+)$');

  const newProps = {};
  const matches = lineRegex.exec(props.location.hash);
  if (matches && matches.length > 1) {
    const line = matches[1];
    newProps.location = {
      hash: `#scroll=${line}&bookmarks=${line}`
    };
  }

  const parsed = queryString.parse(props.location.search === '' ? props.location.hash : props.location.search);

  const { build, test } = props.match.params;
  const logID = makeLogkeeperLogID(build, test, parsed.server, parsed.url);

  return (<Fetch {...props} {...newProps} logIdentity={logID} />);
};

export default LogkeeperLogViewer;
