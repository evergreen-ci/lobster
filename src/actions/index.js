// @flow strict

import type { Action as LogviewerAction } from './logviewer';

export const LOGKEEPER_LOAD_DATA = 'logkeeper:load-data';
export const LOBSTER_LOAD_DATA = 'lobster:load-data';
export const LOGKEEPER_LOAD_RESPONSE = 'logkeeper:response';
export const EVERGREEN_LOAD_DATA = 'evergreen:load-data';
export const EVERGREEN_LOAD_RESPONSE = 'evergreen:response';

export type Line = {
  +lineNumber: number,
  +text: string,
  +port: ?string,
  +gitRef: ?string,
}

export type ColorMap = { [string]: string }

export type Log = {
  +lines: Line[],
  +colorMap: ColorMap
}

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

export type LogType = 'resmoke' | 'evergreen'

export type LogkeeperDataResponse = {|
  +type: 'logkeeper:response',
  +payload: {|
    +type: LogType,
    +data: string
  |},
  +error: boolean
|}

export function loadData(build: string, test: ?string): LogkeeperLoadData {
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

export function logkeeperDataSuccess(data: string, type: LogType): LogkeeperDataResponse {
  return {
    type: LOGKEEPER_LOAD_RESPONSE,
    payload: {
      type: 'resmoke',
      data: data
    },
    error: false
  };
}

export function logkeeperDataError(data: string): LogkeeperDataResponse {
  return {
    type: LOGKEEPER_LOAD_RESPONSE,
    payload: {
      type: 'resmoke',
      data: data
    },
    error: true
  };
}

export type EvergreenTaskLogType = 'all' | 'task' | 'agent' | 'system';

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

export type Action = LogkeeperLoadData
  | LogkeeperDataResponse
  | LobsterLoadData
  | EvergreenLoadData
  | LogviewerAction
