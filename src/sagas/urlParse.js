// @flow

import urlParse from '../urlParse';
import { loadBookmarks, loadInitialFilters, loadInitialHighlights } from '../actions/logviewer';
import { put } from 'redux-saga/effects';
import type { Saga } from 'redux-saga';

export default function*(): Saga<void> {
  const urlData = urlParse(window.location.hash, window.location.href);
  yield put(loadBookmarks([...urlData.bookmarks].map((n) => ({ lineNumber: n }))));
  yield put(loadInitialFilters([...urlData.filters]));
  yield put(loadInitialHighlights([...urlData.highlights]));
}
