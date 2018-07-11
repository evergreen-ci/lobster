// @flow strict

import { combineReducers } from 'redux';
import { logkeeperDataResponse } from './logkeeper';
import settings from './settings';
import filters from './filters';
import highlights from './highlights';
import bookmarks from './bookmarks';
import find from './find';

export const lobster = combineReducers({
  log: logkeeperDataResponse,
  settings: settings,
  filters: filters,
  highlights: highlights,
  bookmarks: bookmarks,
  find: find
});
