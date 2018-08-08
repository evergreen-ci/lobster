// @flow strict

import * as actions from '../actions/logviewer';
import { type SearchEvent } from '../actions/logviewer';
import { put, select } from 'redux-saga/effects';
import type { Saga } from 'redux-saga';
import getLines from '../selectors/lines';

export default function*(event: SearchEvent): Saga<void> {
  const lines = yield select(getLines);
  const numLines = lines.findResults.length;
  if (numLines === 0) {
    return;
  }

  const findIndex = yield select((state) => state.logviewer.find.findIdx);

  const { action } = event.payload;
  if (event.payload.action === 'next') {
    let newIdx = findIndex + 1;
    if (newIdx >= numLines) {
      newIdx = 0;
    }
    yield put(actions.changeFindIdx(newIdx));
  } else if (event.payload.action === 'prev') {
    let newIdx = findIndex - 1;
    if (newIdx < 0) {
      newIdx = numLines - 1;
    }

    yield put(actions.changeFindIdx(newIdx));
  } else if (event.payload.action === 'search') {
    yield put(actions.changeSearch(event.payload.term));
    if (event.payload.term === '') {
      yield put(actions.changeFindIdx(-1));
    }else {
      const newLines = yield select(getLines);
      const newFindIndex = yield select((state) => state.logviewer.find.findIdx);
      if (newLines.findResults.length > 0 && newFindIndex === -1) {
        yield put(actions.changeFindIdx(0));
      }
    }
  }
}
