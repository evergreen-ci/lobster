// @flow strict

/* eslint-disable flowtype/no-weak-types */
/* eslint-disable flowtype/no-flow-fix-me-comments */

import { put, call, select } from 'redux-saga/effects';
import * as actions from '../actions';

const VERSION = 'v1';

const fname = (f: string) => `${VERSION}-${f}`;

const fsUp = (size: number) => {
  return new Promise(function(resolve, reject) {
    if (size === 0) {
      reject();
    }
    const errh = (e) => reject(e);
    window.requestFileSystem(window.PERSISTENT, size, (fs) => resolve(fs), errh);
  });
};

// $FlowFixMe
const write = (fs: any, f: string, blob: Blob) => {
  return new Promise(function(resolve, reject) {
    fs.root.getFile(f, {create: true}, function(fileEntry) {
      fileEntry.createWriter(function(fileWriter) {
        fileWriter.onwriteend = function() {
          console.log(`Added to cache: ${f}`);
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

// $FlowFixMe
export function* writeToCache(f: string): Saga<void> {
  const state = yield select((s) => s.cache);
  if (state.status !== 'ok') {
    return;
  }
  const data = yield select((s) => s.log);
  if (!data.isDone) {
    return;
  }

  try {
    const fs = yield call(fsUp, state.size);
    const log = new Blob([JSON.stringify(data)], {type: 'application/json'});
    yield call(write, fs, fname(f), log);
  } catch (err) {
    console.error(`Failed to write ${f}:`, err);
  }
}

// $FlowFixMe
const fsReadPromise = (fs: any, f: string) => {
  return new Promise(function(resolve, reject) {
    if (!fs) {
      reject();
    }
    fs.root.getFile(f, {create: false}, function(fileEntry) {
      fileEntry.file(function(file) {
        const reader = new FileReader();

        reader.onloadend = function() {
          console.log(`Read processed log data from cache: ${f}`);
          resolve(JSON.parse(this.result));
        };
        reader.onerror = (e) => reject(e);
        reader.onabort = () => reject();

        reader.readAsText(file);
      }, (e) => reject(e));
    }, (e) => reject(e));
  });
};

export function* readFromCache(f: string): Saga<void> {
  const state = yield select((s) => s.cache);
  if (state.status !== 'ok') {
    throw state;
  }
  const fs = yield call(fsUp, state.size);
  const log = yield call(fsReadPromise, fs, fname(f));
  yield put(actions.loadCachedData(log));
}

const entryPromise = (e) => {
  return new Promise(function(resolve, reject) {
    const success = () => resolve();
    const erh = (err) => reject(err);
    if (e.isDirectory) {
      e.removeRecursively(success, erh);
    } else {
      e.remove(success, erh);
    }
  });
};

export function* wipeCache(): Saga<void> {
  const state = yield select((s) => s.cache);
  if (state.status !== 'ok') {
    console.log('Caching is not set up; assuming no data in filesystem');
    return;
  }
  try {
    const fs = yield call(fsUp, state.size);
    fs.root.createReader().readEntries(function(entries) {
      return Promise.all(entries.map((e) => entryPromise(e)));
    },
    (err) => console.error(`Failed to wipe Lobster FileSystem: ${err}`));
  } catch (err) {
    console.error('Failed to wipe cache:', err);
  }
}

// $FlowFixMe
function remove(fs: any, f: string) {
  return new Promise(function(resolve, reject) {
    fs.root.getFile(f, (fileEntry) => {
      entryPromise(fileEntry)
        .then(() => resolve())
        .catch((e) => reject(e));
    }, (e) => reject(e));
  });
}

function* wipeFileFromCache(f: string): Saga<void> {
  const state = yield select((s) => s.cache);
  if (state.status !== 'ok') {
    console.log('Caching is not set up; assuming no data in filesystem');
    return;
  }
  try {
    const fs = yield call(fsUp, state.size);
    yield remove(fs, f);
  } catch (err) {
    console.error('Failed to wipe cache:', err);
  }
}

export function* boil(action: actions.WipeCache): Saga<void> {
  if (action.payload.file == null) {
    yield wipeCache();
  } else {
    yield wipeFileFromCache(action.payload.file);
  }
  window.localStorage.clear();
  window.refresh();
}
