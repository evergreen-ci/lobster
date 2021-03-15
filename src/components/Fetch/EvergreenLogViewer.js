// @flow

import React from "react";
import Fetch from ".";
import { stringToEvergreenTaskLogType, type LogIdentity } from "../../models";
import type { ContextRouter } from "react-router-dom";

function makeEvergreenLogID(
  isTest: boolean,
  id: ?string,
  type: ?string,
  execution: ?string
): ?LogIdentity {
  if (id == null) {
    return null;
  }

  if (type != null) {
    if (isTest) {
      return {
        type: "evergreen-test-by-name",
        task: id,
        execution: parseInt(execution, 10),
        test: type,
      };
    }
    const logType = stringToEvergreenTaskLogType(type);
    if (logType == null) {
      return null;
    }
    return {
      type: "evergreen-task",
      id: id,
      execution: parseInt(execution, 10) || 0,
      log: logType,
    };
  }

  return {
    type: "evergreen-test",
    id: id,
  };
}

const lineRegex = new RegExp("#L([0-9]+)");

const EvergreenLogViewer = (props: ContextRouter) => {
  const newProps = Object.assign({}, props);
  const matches = lineRegex.exec(props.location.hash);
  if (matches && matches.length > 1) {
    const line = matches[1];
    newProps.location.hash = `#scroll=${line}&bookmarks=${line}`;
  }
  const { id, type, execution } = props.match.params;
  const logID = makeEvergreenLogID(
    props.location.pathname.startsWith("/lobster/evergreen/test/"),
    id,
    type,
    execution
  );

  return <Fetch {...newProps} logIdentity={logID} />;
};

export default EvergreenLogViewer;
