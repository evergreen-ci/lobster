// @flow strict
// $FlowFixMe
import Reflux from 'reflux';

const Actions = Reflux.createActions([
  'loadDataUrl',
  'loadData'
]);

export default Actions;

export const LOGKEEPER_LOAD_DATA = 'logkeeper:load-data';
export const LOGKEEPER_LOAD_RESPONSE = 'logkeeper:response';

export type LogkeeperLoadData = {
  +type: 'logkeeper:load-data',
  +build: string,
  +test: ?string
}

export type LogkeeperDataResponse = {
  +type: 'logkeeper:response',
  +status: 'success' | 'error',
  +data: string
}

export type Action = LogkeeperLoadData
  | LogkeeperDataResponse

export function loadData(build: string, test: ?string): LogkeeperLoadData {
  return {
    type: LOGKEEPER_LOAD_DATA,
    build: build,
    test: test
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
