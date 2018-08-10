// @flow strict

import logfetchers from './logfetchers';
import search from './search';
import { boil } from './lobstercage';
import type { Saga } from 'redux-saga';
import { takeEvery, takeLatest, put } from 'redux-saga/effects';
import * as actions from '../actions';
import { LOGVIEWER_SEARCH_EVENT } from '../actions/logviewer';


function* doop(action: actions.SetupCache): Saga<void> {
  console.log(doop);
  yield put(action);
}

export default function* rootSaga(): Saga<void> {
  yield takeLatest(actions.LOAD_LOG, logfetchers);
  yield takeLatest(actions.WIPE_CACHE, boil);
  yield takeEvery(LOGVIEWER_SEARCH_EVENT, search);
}
