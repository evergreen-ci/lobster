// @flow strict

import type { Action as LogviewerAction } from './logviewer';
import type { Log } from '../models';

export const LOGKEEPER_LOAD_DATA = 'logkeeper:load-data';
export const LOBSTER_LOAD_DATA = 'lobster:load-data';
export const PROCESS_RESPONSE = 'process-response';
export const LOAD_CACHED_DATA = 'load-cached-data';
export const EVERGREEN_LOAD_DATA = 'evergreen:load-data';
export const SETUP_CACHE = 'setup-cache';
export const WIPE_CACHE = 'wipe-cache';

export type LogkeeperLoadData = {|
  +type: 'logkeeper:load-data',
  +payload: {|
    +build: string,
    +test: ?string
  |}
|}

export type LobsterLoadData = {|
  +type: 'lobster:load-data',
  +payload: {|
    +url: string,
    +server: string
  |}
|}

export type LogType = 'resmoke' | 'raw'

export type ProcessResponse = {|
  +type: 'process-response',
  +payload: {|
    +type: LogType,
    +data: string,
    +isDone: boolean
  |},
  +error: boolean
|}

export function logkeeperLoadData(build: string, test: ?string): LogkeeperLoadData {
  return {
    type: LOGKEEPER_LOAD_DATA,
    payload: {
      build: build,
      test: test
    }
  };
}

// Load data from the lobster server
export function lobsterLoadData(server: string, url: string): LobsterLoadData {
  return {
    type: LOBSTER_LOAD_DATA,
    payload: {
      url: url,
      server: server
    }
  };
}

export function processData(data: string, type: LogType, isDone?: boolean): ProcessResponse {
  return {
    type: PROCESS_RESPONSE,
    payload: {
      type: type,
      data: data,
      isDone: isDone || false
    },
    error: false
  };
}

export function processDataError(data: string): ProcessResponse {
  return {
    type: PROCESS_RESPONSE,
    payload: {
      type: 'resmoke',
      data: data,
      isDone: true
    },
    error: true
  };
}

export type LoadCachedData = {|
  type: 'load-cached-data',
  payload: {|
    log: Log
  |}
|}

export function loadCachedData(data: Log): LoadCachedData {
  return {
    type: LOAD_CACHED_DATA,
    payload: {
      log: data
    }
  };
}

export type CacheStatus = 'ok' | 'error' | 'never' | 'later' | 'unsupported' | null;

export type SetupCache = {|
  +type: 'setup-cache',
  +payload: {
    +status: CacheStatus,
    +size: number
  },
  +error: boolean
|}

export function setCache(status: CacheStatus, size: number): SetupCache {
  return {
    type: SETUP_CACHE,
    payload: {
      status: status,
      size: size
    },
    error: false
  };
}

const evergreenTaskLogTypes: { [string]: string } = {
  'all': 'ALL',
  'task': 'T',
  'agent': 'A',
  'system': 'S'
  // 'event': 'E' // Not actually supported by the api
};

export type EvergreenTaskLogType = $Keys<typeof evergreenTaskLogTypes>;

export function stringToInteralEvergreenTaskLogType(a: string): ?string {
  return evergreenTaskLogTypes[a];
}

export function stringToEvergreenTaskLogType(a: string): ?EvergreenTaskLogType {
  if (!evergreenTaskLogTypes[a]) {
    return null;
  }

  return a;
}

export type EvergreenTaskLog = {|
  type: 'task',
  id: string,
  execution: number,
  log: EvergreenTaskLogType
|};

export type EvergreenTestLog = {|
  type: 'test',
  id: string,
|};

export type EvergreenLoadData = {|
  +type: 'evergreen:load-data',
  +payload: EvergreenTaskLog | EvergreenTestLog
|}

export function evergreenLoadTaskLog(id: string, execution: number, log: EvergreenTaskLogType): EvergreenLoadData {
  return {
    type: 'evergreen:load-data',
    payload: {
      type: 'task',
      id: id,
      execution: execution,
      log: log
    }
  };
}

export function evergreenLoadTestLog(id: string): EvergreenLoadData {
  return {
    type: 'evergreen:load-data',
    payload: {
      type: 'test',
      id: id
    }
  };
}

export type WipeCache = {|
  type: 'wipe-cache',
  payload: {|
    file: ?string
  |}
|}

export function wipeCache(): WipeCache {
  return {
    type: WIPE_CACHE,
    payload: {
      file: null
    }
  };
}

export function fromFileFromCache(f: string): WipeCache {
  return {
    type: WIPE_CACHE,
    payload: {
      file: f
    }
  };
}
export type Action = ProcessResponse
  | LoadCachedData
  | WipeCache
  | LogkeeperLoadData
  | LobsterLoadData
  | EvergreenLoadData
  | LogviewerAction
