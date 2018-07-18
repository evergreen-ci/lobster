// @flow strict

import type { Action, Log, EvergreenTaskLogType } from '../actions';
import { LOGKEEPER_LOAD_RESPONSE } from '../actions';
import * as LogProcessor from './LogProcessor';

const initialState: Log = {
  lines: [],
  colorMap: new Map(),
  isDone: false
};

type ProcessorFunc = (string) => Log

const processors: {[EvergreenTaskLogType]: ProcessorFunc} = {
  resmoke: LogProcessor.resmoke,
  raw: LogProcessor.raw('\n')
};

export default function(state: Log = initialState, action: Action): Log {
  if (action.type !== LOGKEEPER_LOAD_RESPONSE || action.error) {
    if (action.error) {
      return {...state, isDone: false};
    }
    return state;
  }

  const f = processors[action.payload.type];
  if (f) {
    return f(action.payload.data);
  }

  return initialState;
}
