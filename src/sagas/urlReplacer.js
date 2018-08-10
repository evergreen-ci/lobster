// @flow

import queryString from '../thirdparty/query-string';
import urlParse, { replaceState } from '../urlParse';
import { loadBookmarks, loadInitialFilters, loadInitialHighlights } from '../actions/logviewer';
import { put, takeEvery, select } from 'redux-saga/effects';
import type { Saga } from 'redux-saga';
import * as logviewerActions from '../actions/logviewer';
import type { Filter, Highlight, Bookmark } from '../models';

const getFilters = (state) => state.logviewer.filters;
function* filter(): Saga<void> {
  const urlData = urlParse(window.location.hash, window.location.href);
  const filters = yield select(getFilters);

  replaceState({ ...urlData, filters: filters });
}

const getHighlights = (state) => state.logviewer.highlights;
function* highlight(): Saga<void> {
  const urlData = urlParse(window.location.hash, window.location.href);
  const highlights = yield select(getHighlights);

  replaceState({ ...urlData, highlights: highlights });
}

const getBookmarks = (state) => state.logviewer.bookmarks;
function* bookmark(): Saga<void> {
  const urlData = urlParse(window.location.hash, window.location.href);
  const bookmarks = yield select(getBookmarks);
  const bookmarksSet = new Set(bookmarks.map((bk) => bk.lineNumber));

  replaceState({ ...urlData, bookmarks: bookmarksSet});
}

export default function*(): Saga<void> {
  while (true) {
    yield takeEvery(logviewerActions.LOGVIEWER_CHANGE_FILTER, filter);
    yield takeEvery(logviewerActions.LOGVIEWER_CHANGE_HIGHLIGHT, highlight);
    yield takeEvery(logviewerActions.LOGVIEWER_CHANGE_BOOKMARK, bookmark);
    yield takeEvery(logviewerActions.LOGVIEWER_ENSURE_BOOKMARK, bookmark);
  }
}
