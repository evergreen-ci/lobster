// @flow

import { combineReducers } from 'redux';
import processData from './processData';
import settings from './settings';
import filters from './filters';
import highlights from './highlights';
import bookmarks from './bookmarks';
import find from './find';
import cache from './cache';
import scrollView from './scrollView';

export const lobster = combineReducers({
  cache: cache,
  log: processData,
  settings: settings,
  filters: filters,
  highlights: highlights,
  bookmarks: bookmarks,
  find: find,
  scrollView: scrollView
});
