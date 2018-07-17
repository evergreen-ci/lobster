// @flow strict

import type { Action, Log } from '../actions';
import { LOGKEEPER_LOAD_RESPONSE } from '../actions';
import * as LogProcessor from './LogProcessor';

const initialState: Log = {
  lines: [],
  colorMap: new Map()
};

export function logkeeperDataResponse(state: Log = initialState, action: Action): Log {
  if (action.type !== LOGKEEPER_LOAD_RESPONSE || action.error) {
    return state;
  }

  console.log(action.payload);

  switch (action.payload.type) {
    case 'resmoke':
      return LogProcessor.resmoke(action.payload.data);

    case 'evergreen':
      return LogProcessor.evergreen(action.payload.data);

    default:
      break;
  }

  return state;
}
