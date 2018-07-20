// @flow strict

import { put, call, takeEvery } from 'redux-saga/effects';
import type { Saga } from 'redux-saga';
import * as actions from '../actions';
import * as api from '../api/logkeeper';
import { fetchEvergreen } from '../api/evergreen';
import { writeToCache, readFromCache } from './lobstercage';

export function* logkeeperLoadData(action: actions.LogkeeperLoadData): Saga<void> {
  console.log('fetch (logkeeper)', action.payload.build, action.payload.test);
  const test = action.payload.test || 'all';
  const f = `fetchLogkeeper-${action.payload.build}-${test}.json`;
  try {
    try {
      yield call(readFromCache, f);
    } catch (_err) {
      const resp = yield call(api.fetchLogkeeper, action.payload.build, action.payload.test);
      if (resp.status !== 200) {
        throw resp;
      }

      const data = yield resp.text();
      yield put.resolve(actions.processData(data, 'resmoke', true));
      yield call(writeToCache, f);
    }
  } catch (error) {
    yield put(actions.processDataError(error));
  }
}

export function* lobsterLoadData(action: actions.LobsterLoadData): Saga<void> {
  console.log('fetch (lobster server)', action.payload.server, action.payload.url);
  try {
    const resp = yield call(api.fetchLobster, action.payload.server, action.payload.url);
    if (resp.status !== 200) {
      throw resp;
    }

    const data = yield resp.text();
    yield put(actions.processData(data, 'resmoke', true));
  } catch (error) {
    yield put(actions.processDataError(error));
  }
}

export function* evergreenLoadData(action: actions.EvergreenLoadData): Saga<void> {
  console.log(`fetch (evergreen) ${JSON.stringify(action.payload)}`);
  try {
    const resp = yield call(fetchEvergreen, action.payload);
    if (resp.status !== 200) {
      throw resp;
    }

    const body = yield resp.text();
    yield put(actions.processData(body, 'raw', true));
  } catch (error) {
    yield put(actions.processDataError(error));
  }
}

export default function* fetcher(): Saga<void> {
  yield takeEvery(actions.LOBSTER_LOAD_DATA, lobsterLoadData);
  yield takeEvery(actions.LOGKEEPER_LOAD_DATA, logkeeperLoadData);
  yield takeEvery(actions.EVERGREEN_LOAD_DATA, evergreenLoadData);
}
