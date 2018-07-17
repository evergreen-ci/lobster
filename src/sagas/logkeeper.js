// @flow strict

import { put, call } from 'redux-saga/effects';
import type { Saga } from 'redux-saga';
import * as actions from '../actions';
import * as api from '../api/logkeeper';
import { fetchEvergreen } from '../api/evergreen';

export function* logkeeperLoadData(action: actions.LogkeeperLoadData): Saga<void> {
  console.log('fetch', action.payload.build, action.payload.test);
  try {
    const data = yield call(api.fetchLogkeeper, action.payload.build, action.payload.test);
    yield put(actions.logkeeperDataSuccess(data.data, 'resmoke'));
  } catch (error) {
    yield put(actions.logkeeperDataError(error));
  }
}

export function* lobsterLoadData(action: actions.LobsterLoadData): Saga<void> {
  console.log('fetch', action.payload.server, action.payload.url);
  try {
    const data = yield call(api.fetchLobster, action.payload.server, action.payload.url);
    yield put(actions.logkeeperDataSuccess(data.data, 'resmoke'));
  } catch (error) {
    yield put(actions.logkeeperDataError(error));
  }
}

export function* evergreenLoadData(action: actions.EvergreenLoadData): Saga<void> {
  console.log(`fetch (evergreen) ${JSON.stringify(action.payload)}`);
  try {
    const resp = yield call(fetchEvergreen, action.payload);
    const body = yield resp.text();
    yield put(actions.logkeeperDataSuccess(body, 'raw'));
  } catch (error) {
    yield put(actions.logkeeperDataError(error));
  }
}

