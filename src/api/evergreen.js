// @flow strict

import type { EvergreenLog, EvergreenTaskLogType } from '../models';
import { EVERGREEN_BASE } from '../config';
import { stringToInteralEvergreenTaskLogType } from '../models';

export function taskLogURL(id: string, execution: number, type: EvergreenTaskLogType): string {
  const logType = stringToInteralEvergreenTaskLogType(type) || 'ALL';
  return `${EVERGREEN_BASE}/task_log_raw/${id}/${execution}?type=${logType}`;
}

export function taskLogRawURL(id: string, execution: number, type: EvergreenTaskLogType): string {
  return `${taskLogURL(id, execution, type)}&text=true`;
}

export function testLogURL(id: string): string {
  return `${EVERGREEN_BASE}/test_log/${id}`;
}

export function testLogRawURL(id: string): string {
  return `${testLogURL(id)}?raw=1`;
}

export function taskURL(taskID: string, execution: ?number): string {
  const base = `${EVERGREEN_BASE}/task/${taskID}`;

  if (execution == null) {
    return base;
  }

  return base + `/${execution}`;
}

export function fetchEvergreen(log: EvergreenLog): Promise<Response> {
  const init = { method: 'GET', credentials: 'include' };
  let req;
  if (log.type === 'evergreen-task') {
    req = new Request(taskLogRawURL(log.id, log.execution, log.log), init);
  } else if (log.type === 'evergreen-test') {
    req = new Request(testLogRawURL(log.id), init);
  }

  return window.fetch(req);
}
