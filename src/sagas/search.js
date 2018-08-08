// @flow strict

import * as actions from '../actions/logviewer';
import { type SearchEvent } from '../actions/logviewer';
import { put, select } from 'redux-saga/effects';
import type { Saga } from 'redux-saga';

export default function*(event: SearchEvent): Saga<void> {
  const lines = yield select((state) => state.log.lines);
  const numLines = lines.length;
  if (numLines === 0) {
    return;
  }

  const findIndex = yield select((state) => state.logviewer.find.findIdx);

  const { action } = event.payload;
  if (event.payload.action === 'next') {
    let newIdx = findIndex + 1;
    console.log(newIdx, numLines);
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
  }

}
