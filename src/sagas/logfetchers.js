// @flow strict

import { put, call, takeEvery, select } from 'redux-saga/effects';
import type { Saga } from 'redux-saga';
import * as actions from '../actions';
import * as api from '../api/logkeeper';
// import cachedRequest from '../api/cachedRequest';
import { fetchEvergreen } from '../api/evergreen';

const fsWritePromise = (fs: any, f: string, blob: Blob) => {
  return new Promise(function(resolve, reject) {
    fs.root.getFile(f, {create: true}, function(fileEntry) {
      fileEntry.createWriter(function(fileWriter) {
        fileWriter.onwriteend = function() {
          resolve();
        };

        fileWriter.onerror = function(e) {
          reject(e);
        };

        fileWriter.write(blob);
      }, (e) => reject(e));
    }, (e) => reject(e));
  });
};

function* cache(fs: any, f: string): Saga<void> {
  if (!fs) {
    return;
  }
  const data = yield select((s) => s.log);
  if (!data.isDone) {
    return;
  }

  const log = new Blob([JSON.stringify(data)], {type: 'application/json'});
  try {
    yield call(fsWritePromise, fs, f, log);
  } catch (err) {
    console.error(`Failed to write ${f}:`, err);
  }
}

const fsReadPromise = (fs: any, f: string) => {
  return new Promise(function(resolve, reject) {
    if (!fs) {
      reject();
    }
    fs.root.getFile(f, {create: false}, function(fileEntry) {
      fileEntry.file(function(file) {
        const reader = new FileReader();

        reader.onloadend = function() {
          resolve(JSON.parse(this.result));
        };

        reader.readAsText(file);
      }, (e) => reject(e));
    }, (e) => reject(e));
  });
};

const fsUp = (size) => {
  return new Promise(function(resolve, reject) {
    if (size === 0) {
      reject();
    }
    const errh = (e) => reject(e);
    window.requestFileSystem(window.PERSISTENT, size, (fs) => resolve(fs), errh);
  });
};

export function* logkeeperLoadData(action: actions.LogkeeperLoadData): Saga<void> {
  console.log('fetch (logkeeper)', action.payload.build, action.payload.test);
  const test = action.payload.test || 'all';
  const f = `fetchLogkeeper-${action.payload.build}-${test}.json`;
  const state = yield select((s) => s.cache);
  let fs;
  try {
    try {
      fs = yield call(fsUp, state.size);
      const log = yield call(fsReadPromise, fs, f);
      yield put(actions.loadCachedData(log));
    } catch (_err) {
      const resp = yield call(api.fetchLogkeeper, action.payload.build, action.payload.test);
      if (resp.status !== 200) {
        throw resp;
      }

      const data = yield resp.text();
      yield put(actions.processData(data, 'resmoke', true));
      yield call(cache, fs, f);
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
