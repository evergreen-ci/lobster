// @flow

import logfetchers from './logfetchers';
import search from './search';
import { boil } from './lobstercage';
import type { Saga } from 'redux-saga';
import { takeEvery, takeLatest } from 'redux-saga/effects';
import * as actions from '../actions';
import * as logviewerActions from '../actions/logviewer';
import { LOAD_LOG } from '../actions';
import updateURL from '../sagas/updateURL';

export default function* rootSaga(): Saga<void> {
  yield takeLatest(actions.LOAD_LOG, logfetchers);
  yield takeLatest(actions.WIPE_CACHE, boil);
  yield takeEvery(logviewerActions.LOGVIEWER_SEARCH_EVENT, search);
  yield takeEvery([logviewerActions.LOGVIEWER_CHANGE_FILTER,
    logviewerActions.LOGVIEWER_CHANGE_HIGHLIGHT,
    logviewerActions.LOGVIEWER_CHANGE_BOOKMARK,
    logviewerActions.LOGVIEWER_ENSURE_BOOKMARK,
    LOAD_LOG
  ], updateURL);
}
