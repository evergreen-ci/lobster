// @flow strict

import type { EvergreenTestLog, EvergreenTaskLogType, EvergreenTaskLog } from '../actions';
import { EVERGREEN_BASE } from '../config';

function shortType(type: EvergreenTaskLogType): string {
  switch (type) {
    case 'task':
      return 'T';

    case 'agent':
      return 'A';

    case 'system':
      return 'S';

    default:
      return 'ALL';
  }
}

function taskLogURL(id: string, execution: number, type: EvergreenTaskLogType): string {
  return `${EVERGREEN_BASE}/task_log_raw/${id}/${execution}?type=${shortType(type)}&text=true`;
}

function testLogURL(id: string): string {
  return `${EVERGREEN_BASE}/test_log/${id}?raw=1`;
}

export function fetchEvergreen(log: EvergreenTaskLog | EvergreenTestLog): Promise<Response> {
  const init = {method: 'GET'};
  let req;
  if (log.type === 'task') {
    req = new Request(taskLogURL(log.id, log.execution, log.type), init);
  } else if (log.type === 'test') {
    req = new Request(testLogURL(log.id), init);
  }

  return window.fetch(req);
}
