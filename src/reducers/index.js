// @flow strict

import { combineReducers } from 'redux';
import { logkeeperDataResponse } from './logkeeper';
import settings from './settings';

export const lobster = combineReducers({
  log: logkeeperDataResponse,
  settings: settings


  // here are some suggestions:
  // filters: reducer returns list of these filters [{text: '', on: bool, inverse: bool}]
  // highlights: reducer returns the highlight objects
});
