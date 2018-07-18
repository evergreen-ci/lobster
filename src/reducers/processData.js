// @flow strict

import type { Log } from '../models';
import type { Action, EvergreenTaskLogType } from '../actions';
import { PROCESS_RESPONSE, LOAD_CACHED_DATA } from '../actions';
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
  if (action.type === LOAD_CACHED_DATA) {
    return action.payload.log;
  }
  if (action.type !== PROCESS_RESPONSE || action.error) {
    if (action.error === true) {
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
