// @flow

import logfetchers from './logfetchers';
import search from './search';
import { boil } from './lobstercage';
import type { Saga } from 'redux-saga';
import { takeEvery, takeLatest } from 'redux-saga/effects';
import * as actions from '../actions';
import updateURL from '../sagas/updateURL';

export default function* rootSaga(): Saga<void> {
  yield takeLatest(actions.LOAD_LOG, logfetchers);
  yield takeLatest(actions.WIPE_CACHE, boil);
  yield takeEvery([
    actions.LOGVIEWER_SEARCH_EVENT,
    actions.LOGVIEWER_CHANGE_SEARCH,
    actions.LOGVIEWER_CHANGE_START_RANGE,
    actions.LOGVIEWER_CHANGE_END_RANGE
  ], search);
  yield takeEvery([
    actions.LOGVIEWER_CHANGE_FILTER,
    actions.LOGVIEWER_CHANGE_HIGHLIGHT,
    actions.LOGVIEWER_CHANGE_BOOKMARK,
    actions.LOGVIEWER_ENSURE_BOOKMARK,
    actions.LOAD_LOG
  ], updateURL);
}
