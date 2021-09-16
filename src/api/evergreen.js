// @flow strict

import type { EvergreenLog, EvergreenTaskLogType } from "../models";
import { EVERGREEN_BASE } from "../config";
import { stringToInteralEvergreenTaskLogType } from "../models";

export function taskLogURL(
  id: string,
  execution: number,
  type: EvergreenTaskLogType,
  html: boolean,
): string {
  const logType = stringToInteralEvergreenTaskLogType(type) || "ALL";
  return `${EVERGREEN_BASE}/task_log_raw/${id}/${execution}?type=${logType}${html ? "" : "&text=true"}`;
}

export function testLogURL(
  taskId: string,
  execution: string,
  testId: string,
  groupId: string,
  html: boolean,
): string {
  return `${EVERGREEN_BASE}/test_log/${taskId}/${execution}?test_name=${testId}${groupId ? `&group_id=${groupId}`: ""}${html ? "" : "&text=true"}`;
}

export function testLogCompleteURL(
  taskId: string,
  execution: string,
  groupId: string,
  html: boolean,
): string {
  return `${EVERGREEN_BASE}/test_log/${taskId}/${execution}?${groupId ? `group_id=${groupId}&`: ""}${html ? "" : "text=true"}`;
}

export function taskURL(taskID: string, execution: ?number): string {
  return `${EVERGREEN_BASE}/task/${taskID}${Number.isFinite(execution) ? `/${execution}`: ""}`
}

export async function fetchEvergreen(log: EvergreenLog): Promise<Response> {
  const init = { method: "GET", credentials: "include" };
  let req = "";
  if (log.type === "evergreen-task") {
    req = new Request(taskLogURL(log.id, log.execution, log.log), init);
  } else if (log.type === "evergreen-test") {
    req = new Request(testLogURL(log.taskId, log.execution, log.testId, log.groupId), init);
  } else if (log.type === "evergreen-test-complete") {
    req = new Request(testLogCompleteURL(log.taskId, log.execution, log.groupId), init);
  }

  return window.fetch(req);
}
