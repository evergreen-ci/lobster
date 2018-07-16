// @flow strict

import { put, call } from 'redux-saga/effects';
import type { Saga } from 'redux-saga';
import * as actions from '../actions';
import * as api from '../api/logkeeper';

export function* logkeeperLoadData(action: actions.LogkeeperLoadData): Saga<void> {
  console.log('fetch (logkeeper)', action.payload.build, action.payload.test);
  try {
    const resp = yield call(api.fetchLogkeeper, action.payload.build, action.payload.test);
    const data = yield resp.text();
    yield put(actions.logkeeperDataSuccess(data));
    resp.close();
  } catch (error) {
    yield put(actions.logkeeperDataError(error));
  }
}

export function* lobsterLoadData(action: actions.LobsterLoadData): Saga<void> {
  console.log('fetch (lobster server)', action.payload.server, action.payload.url);
  try {
    const resp = yield call(api.fetchLobster, action.payload.server, action.payload.url);
    const data = yield resp.text();
    yield put(actions.logkeeperDataSuccess(data));
    resp.close();
  } catch (error) {
    yield put(actions.logkeeperDataError(error));
  }
}
