// @flow strict

import { put, call } from 'redux-saga/effects'
import type { Saga } from 'redux-saga';
import * as actions from '../actions';
import * as api from '../api/logkeeper';

export function* logkeeperLoadData(action: actions.LogkeeperLoadData): Saga<void> {
  console.log("fetch", action.build, action.test);
  try {
    const data = yield call(api.fetchLogkeeper, action.build, action.test);
    yield put(actions.logkeeperDataSuccess(data.data));

  } catch(error) {
    yield put(actions.logkeeperDataError(error));
  }
}

