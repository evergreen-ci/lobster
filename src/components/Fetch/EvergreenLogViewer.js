// @flow

import React from "react";
import Fetch from ".";
import { stringToEvergreenTaskLogType, type LogIdentity } from "../../models";
import type { ContextRouter } from "react-router-dom";

function makeEvergreenLogID(params: {
  logType: ?string,
  execution: ?string,
  testId: ?string,
  taskId: ?string,
}): ?LogIdentity {
  const { logType, execution, testId, taskId } = params;
  const executionAsNumber = parseInt(execution, 10) || 0;

  if (logType) {
    return {
      type: "evergreen-task",
      id: taskId || "",
      execution: executionAsNumber,
      log: stringToEvergreenTaskLogType(logType),
    };
  }

  return {
    type: "evergreen-test",
    testId: testId || "",
    execution: executionAsNumber,
    taskId: taskId || "",
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
  const logID = makeEvergreenLogID(props.match.params);

  return <Fetch {...newProps} logIdentity={logID} />;
};

export default EvergreenLogViewer;
