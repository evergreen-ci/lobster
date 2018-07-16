// @flow

import { combineReducers } from 'redux';
import { logkeeperDataResponse } from './logkeeper';
import settings from './settings';
import filters from './filters';
import highlights from './highlights';
import bookmarks from './bookmarks';
import find from './find';
import cache from './cache';

export const lobster = combineReducers({
  cache: cache,
  log: logkeeperDataResponse,
  settings: settings,
  filters: filters,
  highlights: highlights,
  bookmarks: bookmarks,
  find: find
});
