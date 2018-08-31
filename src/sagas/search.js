// @flow strict

import * as actions from '../actions';
import { type SearchEvent, LOGVIEWER_SEARCH_EVENT } from '../actions';
import { put, select } from 'redux-saga/effects';
import type { Saga } from 'redux-saga';
import * as selectors from '../selectors';

export default function*(action: SearchEvent): Saga<void> {
  const lines = yield select(selectors.getFindResults);
  const numLines = lines.length;
  if (numLines === 0) {
    return;
  }

  const findIndex = yield select(selectors.getLogViewerFindIdx);
  if (action.type === LOGVIEWER_SEARCH_EVENT) {
    if (action.payload.action === 'next') {
      let newIdx = findIndex + 1;
      if (newIdx >= numLines) {
        newIdx = 0;
      }
      yield put(actions.changeFindIdx(newIdx));
    } else if (action.payload.action === 'prev') {
      let newIdx = findIndex - 1;
      if (newIdx < 0) {
        newIdx = numLines - 1;
      }

      yield put(actions.changeFindIdx(newIdx));
    }
  }
}
