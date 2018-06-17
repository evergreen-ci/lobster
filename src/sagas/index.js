// @flow strict

import { logkeeperLoadData } from './logkeeper';
import type { Saga } from 'redux-saga';
import { takeEvery } from 'redux-saga/effects';
import * as actions from '../actions';

export default function* rootSaga(): Saga<void> {
  yield takeEvery(actions.LOGKEEPER_LOAD_DATA, logkeeperLoadData);
}
