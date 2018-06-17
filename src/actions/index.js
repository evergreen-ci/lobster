// @flow strict

export const LOGKEEPER_LOAD_DATA = 'logkeeper:load-data';
export const LOBSTER_LOAD_DATA = 'lobster:load-data';
export const LOGKEEPER_LOAD_RESPONSE = 'logkeeper:response';

export type Filter = {
  text: string,
  on: boolean,
  inverse: boolean
}

export type Bookmark = {
  lineNumber: number,
}

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
  +build: string,
  +test: ?string
|}

export type LobsterLoadData = {|
  +type: 'lobster:load-data',
  +url: string,
  +server: string,
|}

export type LogkeeperDataResponse = {|
  +type: 'logkeeper:response',
  +status: 'success' | 'error',
  +data: string
|}

export type Action = LogkeeperLoadData
  | LogkeeperDataResponse
  | LobsterLoadData

// Load data from Logkeeper
export function loadData(build: string, test: ?string): LogkeeperLoadData {
  return {
    type: LOGKEEPER_LOAD_DATA,
    build: build,
    test: test
  };
}

// Load data from the lobster server
export function lobsterLoadData(server: string, url: string): LobsterLoadData {
  return {
    type: LOBSTER_LOAD_DATA,
    url: url,
    server: server
  };
}

export function logkeeperDataSuccess(data: string): LogkeeperDataResponse {
  return {
    type: LOGKEEPER_LOAD_RESPONSE,
    status: 'success',
    data: data
  };
}

export function logkeeperDataError(data: string): LogkeeperDataResponse {
  return {
    type: LOGKEEPER_LOAD_RESPONSE,
    status: 'error',
    data: data
  };
}
