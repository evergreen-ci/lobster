// @flow strict

import * as actions from '../actions';

export type CacheSettings = {
  status: actions.CacheStatus,
  size: number
};

const cacheSettings = () => {
  window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
  if (!window.localStorage || !window.requestFileSystem) {
    return {
      status: 'unsupported',
      size: 0
    };
  }
  const size = window.localStorage.getItem('lobster-cache-size');
  return {
    status: window.localStorage.getItem('lobster-cache-status'),
    size: size !== null ? parseInt(size, 10) : 0
  };
};

const initialState: CacheSettings = cacheSettings();

export default function(state: CacheSettings = initialState, action: actions.SetupCache): CacheSettings {
  if (action.type !== actions.SETUP_CACHE) {
    return state;
  }

  if (action.payload.status === 'never') {
    window.localStorage.setItem('lobster-cache-status', action.payload.status);
  } else if (action.payload.status === 'error') {
    console.log('Failed to setup FileSystem');
  } else if (action.payload.status === 'ok') {
    window.localStorage.setItem('lobster-cache-status', action.payload.status);
    window.localStorage.setItem('lobster-cache-size', action.payload.size);
  }

  return {
    ...action.payload
  };
}
