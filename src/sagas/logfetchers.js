// @flow strict

import { put, call } from 'redux-saga/effects';
import type { Saga } from 'redux-saga';
import type { LogProcessor, LogkeeperLog, EvergreenLog, LobsterLog } from '../models';
import * as actions from '../actions';
import * as api from '../api';
import { fetchEvergreen } from '../api/evergreen';
import { writeToCache, readFromCache } from './lobstercage';

// $FlowFixMe
function* cacheFetch(f: string, processor: LogProcessor, ...args: any[]): Saga<void> {
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
      yield put.resolve(actions.processData(data, processor, true));
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

export function* logkeeperLoadData(identity: LogkeeperLog): Saga<void> {
  console.log('fetch (logkeeper)', identity.build, identity.test);
  const test = identity.test || 'all';
  const f = `fetchLogkeeper-${identity.build}-${test}.json`;

  yield cacheFetch(f, 'resmoke', api.fetchLogkeeper, identity.build, identity.test);
}

export function* lobsterLoadData(identity: LobsterLog): Saga<void> {
  const { server, file } = identity;
  console.log('fetch (lobster server)', server, file);
  try {
    const resp = yield call(api.fetchLobster, server, file);
    if (resp.status !== 200) {
      throw resp;
    }

    const data = yield resp.text();
    yield put(actions.processData(data, 'resmoke', true));
  } catch (error) {
    yield put(actions.processDataError(error));
  }
}

export function* evergreenLoadData(identity: EvergreenLog): Saga<void> {
  console.log(`fetch (evergreen) ${JSON.stringify(identity)}`);
  // DO NOT cache Evergreen task logs without checking if the task is done
  if (identity.type === 'evergreen-test') {
    const f = `fetchEvergreen-test-${identity.id}`;
    yield cacheFetch(f, 'raw', api.fetchEvergreen, identity);
    return;
  }
  try {
    const resp = yield call(fetchEvergreen, identity);
    if (resp.status !== 200) {
      throw resp;
    }

    const body = yield resp.text();
    yield put(actions.processData(body, 'raw', true));
  } catch (error) {
    yield put(actions.processDataError(error));
  }
}

export default function*(action: actions.LoadLog): Saga<void> {
  const { identity } = action.payload;
  switch (identity.type) {
    case 'evergreen-test':
    case 'evergreen-task':
      yield call(evergreenLoadData, identity);
      break;

    case 'lobster':
      yield call(lobsterLoadData, identity);
      break;

    case 'logkeeper':
      yield call(logkeeperLoadData, identity);
      break;

    // no default
  }
}
