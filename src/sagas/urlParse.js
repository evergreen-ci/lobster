// @flow

import urlParse from '../urlParse';
import { toggleCaseSensitivity, scrollToLine, ensureBookmark, loadBookmarks, loadInitialFilters, loadInitialHighlights } from '../actions';
import { put, select } from 'redux-saga/effects';
import type { Saga } from 'redux-saga';
import { getLogViewerSettings } from '../selectors';

export default function*(): Saga<void> {
  const urlData = urlParse(window.location.hash, window.location.href);
  yield put(loadBookmarks([...urlData.bookmarks].map((n) => ({ lineNumber: n }))));
  yield put(loadInitialFilters([...urlData.filters]));
  yield put(loadInitialHighlights([...urlData.highlights]));

  if (urlData.scroll != null && Number.isFinite(urlData.scroll)) {
    const { scroll } = urlData;
    yield put(scrollToLine(scroll));
    yield put(ensureBookmark(scroll));
  }

  if (urlData.caseSensitive !== null && urlData.caseSensitive !== undefined) {
    const settings = yield select(getLogViewerSettings);
    if (settings != urlData.caseSensitive) {
      yield put(toggleCaseSensitivity);
    }
  }
}
