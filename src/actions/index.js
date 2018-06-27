// @flow strict

export const LOGKEEPER_LOAD_DATA = 'logkeeper:load-data';
export const LOBSTER_LOAD_DATA = 'lobster:load-data';
export const LOGKEEPER_LOAD_RESPONSE = 'logkeeper:response';
export const CHANGE_SETTING = 'change-setting';
export const CHANGE_FILTER = 'change-filter';

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

export type LogkeeperDataResponse = {|
  +type: 'logkeeper:response',
  +payload: {|
    +data: string
  |},
  +error: boolean
|}

export type ChangeSetting = {|
  +type: 'change-setting',
  +payload: {|
    +setting: string,
    +value: string
  |}
|}

export type LoadSetting = {|
  +type: 'load-setting',
  +payload: {|
    +setting: string
  |}
|}

export type Action = LogkeeperLoadData
  | LogkeeperDataResponse
  | LobsterLoadData
  | ChangeSetting
  | LoadSetting

// Load data from Logkeeper
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

export function logkeeperDataSuccess(data: string): LogkeeperDataResponse {
  return {
    type: LOGKEEPER_LOAD_RESPONSE,
    payload: {
      data: data
    },
    error: false
  };
}

export function logkeeperDataError(data: string): LogkeeperDataResponse {
  return {
    type: LOGKEEPER_LOAD_RESPONSE,
    payload: {
      data: data
    },
    error: true
  };
}

function toggleSetting(setting: string): ChangeSetting {
  return {
    type: CHANGE_SETTING,
    payload: {
      setting: setting,
      value: 'toggle'
    }
  };
}

export function toggleLineWrap(): ChangeSetting {
  return toggleSetting('line-wrap');
}

export function toggleCaseSensitivity(): ChangeSetting {
  return toggleSetting('case-sensitive');
}

export function toggleFilterIntersection(): ChangeSetting {
  return toggleSetting('filter-intersection');
}

function changeFilter(field: string): ChangeFilter {
  return {
    type: CHANGE_FILTER,
    payload: {
      field: field
    }
  };
}

export function toggleFilterInverse(): ChangeFilter {
  return changeFilter('inverse');
}

export function toggleFilter(): ChangeFilter {
  return changeFilter('on');
}
