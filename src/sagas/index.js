// @flow strict

import logfetchers from './logfetchers';
import { boil } from './lobstercage';
import type { Saga } from 'redux-saga';
import { takeEvery, takeLatest } from 'redux-saga/effects';
import * as actions from '../actions';

export default function* rootSaga(): Saga<void> {
  yield takeLatest(actions.LOAD_LOG, logfetchers);
  yield takeEvery(actions.WIPE_CACHE, boil);
}
