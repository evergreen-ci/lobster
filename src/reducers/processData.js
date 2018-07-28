// @flow strict

import type { Log } from '../models';
import type { Action, EvergreenTaskLogType } from '../actions';
import { PROCESS_RESPONSE, LOAD_CACHED_DATA } from '../actions';
import * as logProcessor from './logProcessor';

const initialState: Log = {
  lines: [],
  colorMap: new Map(),
  isDone: false,
  events: []
};

type ProcessorFunc = (string) => Log

const processors: {[EvergreenTaskLogType]: ProcessorFunc} = {
  resmoke: logProcessor.resmoke,
  raw: logProcessor.raw('\n')
};

export default function(state: Log = initialState, action: Action): Log {
  if (action.type === LOAD_CACHED_DATA) {
    return action.payload.log;
  }
  if (action.type !== PROCESS_RESPONSE || action.error) {
    if (action.error === true) {
      return { ...state, isDone: false };
    }
    return state;
  }

  const f = processors[action.payload.type];
  if (f) {
    return f(action.payload.data);
  }

  return initialState;
}
