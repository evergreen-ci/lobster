// @flow

import React from "react";
import Fetch from ".";
import { stringToEvergreenTaskLogType, type LogIdentity } from "../../models";
import type { ContextRouter } from "react-router-dom";

function makeEvergreenLogID(
  isTest: boolean,
  id: ?string,
  type: ?string,
  execution: ?string,
  groupId: ?string,
  taskId: ?string
): ?LogIdentity {
  if (id == null) {
    return null;
  }

  const executionAsNumber = parseInt(execution, 10) || 0;

  if (type != null) {
    if (isTest) {
      return {
        type: "evergreen-test-by-name",
        task: id,
        execution: executionAsNumber,
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
      execution: executionAsNumber,
      log: logType,
    };
  }

  return {
    type: "evergreen-test",
    id,
    execution: executionAsNumber,
    groupId: groupId || "",
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
  const { id, type, execution, taskId, groupId } = props.match.params;
  const logID = makeEvergreenLogID(
    props.location.pathname.startsWith("/lobster/evergreen/test/"),
    id,
    type,
    execution,
    groupId,
    taskId
  );

  return <Fetch {...newProps} logIdentity={logID} />;
};

export default EvergreenLogViewer;
