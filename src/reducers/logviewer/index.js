// @flow strict

import filters from './filters';
import highlights from './highlights';
import bookmarks from './bookmarks';
import find from './find';
import settings from './settings';
import settingsPanel from './settingsPanel';
import scrollLine from './scrollLine';
import prettyPrint from './prettyPrint';
import { combineReducers } from 'redux';

export default combineReducers({
  filters: filters,
  highlights: highlights,
  bookmarks: bookmarks,
  find: find,
  settings: settings,
  settingsPanel: settingsPanel,
  scrollLine: scrollLine, 
  prettyPrint: prettyPrint
});
