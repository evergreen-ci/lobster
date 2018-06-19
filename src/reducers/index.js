// @flow strict

import { combineReducers } from 'redux';
import { logkeeperDataResponse } from './logkeeper';

export const lobster = combineReducers({
  log: logkeeperDataResponse
});
