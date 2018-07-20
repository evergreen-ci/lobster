// @flow strict

import { put, call, takeEvery } from 'redux-saga/effects';
import type { Saga } from 'redux-saga';
import type { LogType } from '../models';
import * as actions from '../actions';
import * as api from '../api';
import { fetchEvergreen } from '../api/evergreen';
import { writeToCache, readFromCache } from './lobstercage';

// $FlowFixMe
function* cacheFetch(f: string, type: LogType, ...args: any[]): Saga<void> {
  try {
    try {
      const log = yield call(readFromCache, f);
      if (log != null) {
        yield put(actions.loadCachedData(log));
      }
    } catch (_err) {
      const resp = yield call(...args);
      if (resp.status !== 200) {
        throw resp;
      }

      const data = yield resp.text();
      yield put.resolve(actions.processData(data, type, true));
      try {
        yield call(writeToCache, f);
      } catch (err) {
        console.error(`Failed to cache ${f}: `, err);
      }
    }
  } catch (error) {
    yield put(actions.processDataError(error));
  }
}

export function* logkeeperLoadData(action: actions.LogkeeperLoadData): Saga<void> {
  console.log('fetch (logkeeper)', action.payload.build, action.payload.test);
  const test = action.payload.test || 'all';
  const f = `fetchLogkeeper-${action.payload.build}-${test}.json`;

  yield cacheFetch(f, 'resmoke', api.fetchLogkeeper, action.payload.build, action.payload.test);
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
  // DO NOT cache Evergreen task logs without checking if the task is done
  if (action.payload.type === 'test') {
    const f = `fetchEvergreen-test-${action.payload.id}`;
    yield cacheFetch(f, 'raw', api.fetchEvergreen, action.payload);
    return;
  }
  try {
    // $FlowFixMe
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
