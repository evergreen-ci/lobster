// @flow

import urlParse from "../urlParse";
import {
  toggleFilterIntersection,
  toggleCaseSensitivity,
  scrollToLine,
  ensureBookmark,
  loadBookmarks,
  loadInitialFilters,
  loadInitialHighlights,
  loadShareLine,
} from "../actions";
import { put, select } from "redux-saga/effects";
import type { Saga } from "redux-saga";
import { getLogViewerSettings } from "../selectors";

export default function* (): Saga<void> {
  const urlData = urlParse(window.location.hash, window.location.href);
  yield put(
    loadBookmarks([...urlData.bookmarks].map((n) => ({ lineNumber: n })))
  );
  yield put(loadShareLine(urlData.shareLine));
  yield put(loadInitialFilters([...urlData.filters]));
  yield put(loadInitialHighlights([...urlData.highlights]));

  if (urlData.scroll != null && Number.isFinite(urlData.scroll)) {
    const { scroll } = urlData;
    yield put(scrollToLine(scroll));
    yield put(ensureBookmark(scroll));
  }

  const settings = yield select(getLogViewerSettings);
  if (urlData.caseSensitive !== null && urlData.caseSensitive !== undefined) {
    if (settings !== urlData.caseSensitive) {
      yield put(toggleCaseSensitivity());
    }
  }

  if (
    urlData.filterIsIntersection !== null &&
    urlData.filterIsIntersection !== undefined
  ) {
    if (settings !== urlData.filterIsIntersection) {
      yield put(toggleFilterIntersection());
    }
  }
}
