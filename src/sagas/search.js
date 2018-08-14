// @flow strict

import * as actions from '../actions/logviewer';
import { type SearchEvent, type ChangeSearch, LOGVIEWER_SEARCH_EVENT, LOGVIEWER_CHANGE_SEARCH } from '../actions';
import { put, select } from 'redux-saga/effects';
import type { Saga } from 'redux-saga';
import { getFilteredLineData, getLogViewerFindIdx } from '../selectors';

export default function*(action: SearchEvent | ChangeSearch): Saga<void> {
  const lines = yield select(getFilteredLineData);
  const numLines = lines.findResults.length;
  if (numLines === 0) {
    return;
  }

  const findIndex = yield select(getLogViewerFindIdx);

  if (action.type === LOGVIEWER_CHANGE_SEARCH) {
    if (action.payload.text === '') {
      yield put(actions.changeFindIdx(-1));
    } else {
      const newFindIndex = yield select(getLogViewerFindIdx);
      if (lines.findResults.length > 0 && newFindIndex === -1) {
        yield put(actions.changeFindIdx(0));
      }
    }
  } else if (action.type === LOGVIEWER_SEARCH_EVENT) {
    if (action.payload.action === 'next') {
      let newIdx = findIndex + 1;
      if (newIdx >= numLines) {
        newIdx = 0;
      }
      console.log(newIdx);
      yield put(actions.changeFindIdx(newIdx));
    } else if (action.payload.action === 'prev') {
      let newIdx = findIndex - 1;
      if (newIdx < 0) {
        newIdx = numLines - 1;
      }

      console.log(newIdx);
      yield put(actions.changeFindIdx(newIdx));
    }
  }
}
