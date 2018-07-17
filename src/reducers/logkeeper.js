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

  switch (action.payload.type) {
    case 'resmoke':
      return LogProcessor.resmoke(action.payload.data);

    case 'raw':
      return LogProcessor.raw('\n')(action.payload.data);

    default:
      return initialState;
  }
}
