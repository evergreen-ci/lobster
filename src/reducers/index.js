// @flow strict

import { combineReducers } from 'redux';
import processData from './processData';
import cache from './cache';
import scrollView from './scrollView';
import logviewer from './logviewer';

export const lobster = combineReducers({
  cache: cache,
  log: processData,
  scrollView: scrollView,
  logviewer: logviewer
});
