// @flow strict

import type { EvergreenTestLog, EvergreenTaskLogType, EvergreenTaskLog } from '../actions';
import { EVERGREEN_BASE } from '../config';
import { stringToInteralEvergreenTaskLogType } from '../actions';

function taskLogURL(id: string, execution: number, type: EvergreenTaskLogType): string {
  const logType = stringToInteralEvergreenTaskLogType(type) || 'all';
  return `${EVERGREEN_BASE}/task_log_raw/${id}/${execution}?type=${logType}&text=true`;
}

function testLogURL(id: string): string {
  return `${EVERGREEN_BASE}/test_log/${id}?raw=1`;
}

export function fetchEvergreen(log: EvergreenTaskLog | EvergreenTestLog): Promise<Response> {
  const init = {method: 'GET', credentials: 'include'};
  let req;
  if (log.type === 'task') {
    req = new Request(taskLogURL(log.id, log.execution, log.log), init);
  } else if (log.type === 'test') {
    req = new Request(testLogURL(log.id), init);
  }

  return window.fetch(req);
}
