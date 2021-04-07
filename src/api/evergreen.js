// @flow strict

import type { EvergreenLog, EvergreenTaskLogType } from "../models";
import { EVERGREEN_BASE } from "../config";
import { stringToInteralEvergreenTaskLogType } from "../models";

export function taskLogURL(
  id: string,
  execution: number,
  type: EvergreenTaskLogType
): string {
  const logType = stringToInteralEvergreenTaskLogType(type) || "ALL";
  return `${EVERGREEN_BASE}/task_log_raw/${id}/${execution}?type=${logType}`;
}

export function taskLogRawURL(
  id: string,
  execution: number,
  type: EvergreenTaskLogType
): string {
  return `${taskLogURL(id, execution, type)}&text=true`;
}

export function testLogURL(id: string): string {
  return `${EVERGREEN_BASE}/test_log/${id}`;
}

export function testLogRawURL(
  id: string,
  taskId: string,
  execution: string
): string {
  return `${EVERGREEN_BASE}/test_log/${taskId}/${execution}/${id}?text=true`;
}

export function testLogByNameURL(
  task: string,
  execution: number,
  testName: string
): string {
  return `${EVERGREEN_BASE}/test_log/${task}/${execution}/${testName}`;
}

export function testLogByNameRawURL(
  task: string,
  execution: number,
  testName: string
): string {
  return `${testLogByNameURL(task, execution, testName)}?raw=1`;
}

export function taskURL(taskID: string, execution: ?number): string {
  const base = `${EVERGREEN_BASE}/task/${taskID}`;

  if (execution == null) {
    return base;
  }

  return base + `/${execution}`;
}

const getTestMetadataURL = ({
  taskId,
  execution,
  testId,
}: {
  taskId: string,
  execution: number,
  testId: string,
}) =>
  `${EVERGREEN_BASE}/rest/v2/tasks/${taskId}/tests?execution=${execution}&test_id=${testId}`;

export async function fetchEvergreen(log: EvergreenLog): Promise<Response> {
  const init = { method: "GET", credentials: "include" };
  let req = "";
  if (log.type === "evergreen-task") {
    req = new Request(taskLogRawURL(log.id, log.execution, log.log), init);
  } else if (log.type === "evergreen-test") {
    const { taskId, testId, execution } = log;
    const testMetadataUrl = getTestMetadataURL({ execution, taskId, testId });
    const testMetadataReq = new Request(testMetadataUrl);
    const res = await window.fetch(testMetadataReq, {
      credentials: "include",
    });
    const data = await res.json();
    let testLogUrl = "";
    if (Array.isArray(data) && data.length) {
      if (data.length > 1) {
        console.error(
          "Multiple results error: multiple results came back from the rest v2 tests endpoint instead of 1. Url:",
          testMetadataUrl
        );
      }
      testLogUrl = data[0].logs.url_raw_display;
      req = new Request(`${EVERGREEN_BASE}${testLogUrl}`, init);
    }
  } else if (log.type === "evergreen-test-by-name") {
    req = new Request(
      testLogByNameRawURL(log.task, log.execution, log.test),
      init
    );
  }

  return window.fetch(req);
}
