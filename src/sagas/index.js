// @flow strict

import { logkeeperLoadData, lobsterLoadData, evergreenLoadData } from './logfetchers';
import { boil } from './lobstercage';
import type { Saga } from 'redux-saga';
import { takeEvery } from 'redux-saga/effects';
import * as actions from '../actions';

export default function* rootSaga(): Saga<void> {
  yield takeEvery(actions.LOBSTER_LOAD_DATA, lobsterLoadData);
  yield takeEvery(actions.LOGKEEPER_LOAD_DATA, logkeeperLoadData);
  yield takeEvery(actions.EVERGREEN_LOAD_DATA, evergreenLoadData);
  yield takeEvery(actions.WIPE_CACHE, boil);
}
