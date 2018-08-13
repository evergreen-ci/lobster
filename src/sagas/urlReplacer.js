// @flow

import queryString from '../thirdparty/query-string';
import urlParse, { replaceState } from '../urlParse';
import { takeEvery, takeLatest, select, put } from 'redux-saga/effects';
import type { Saga } from 'redux-saga';
import { type LoadLog, type Action } from '../actions';

function boolToInt(b: boolean): string {
  return b ? '1' : '0';
}

function makeFilterURLString(filter: Filter): string {
  let res = '';
  res += (filter.on ? '1' : '0');
  res += (filter.inverse ? '1' : '0');
  res += filter.text;
  return res;
}

function makeHighlightURLString(highlight: Highlight): string {
  let res = '';
  res += (highlight.on ? '1' : '0');
  res += (highlight.line ? '1' : '0');
  res += highlight.text;
  return res;
}

export function* updateURL(action: action.Action) {
  const logviewer = yield select((state) => state.logviewer);
  const { identity } = yield select((state) => state.log.identity);
  const { filters, highlights, bookmarks } = logviewer;

  const parsed = {
    f: [],
    h: []
  };
  for (let i = 0; i < filters.length; i++) {
    parsed.f.push(makeFilterURLString(filters[i]));
  }
  for (let i = 0; i < highlights.length; i++) {
    parsed.h.push(makeHighlightURLString(highlights[i]));
  }
  if (bookmarks.length > 0) {
    let bookmarkStr = '';
    for (let i = 0; i < bookmarks.length; i++) {
      bookmarkStr += bookmarks[i].lineNumber;
      if (i !== bookmarks.length - 1) {
        bookmarkStr += ',';
      }
    }
    parsed.bookmarks = bookmarkStr;
  }

  Object.keys(parsed)
    .filter((k) => {
      switch (typeof parsed[k]) {
        case 'array':
          return parsed[k].length === 0;

        case 'object':
          return Object.keys(parsed[k]) === 0;

        default:
          return parsed[k] == null;
      }
    })
    .forEach((k) => {
      delete parsed[k]
    });

  if (identity != null && identity.type === 'lobster') {
    if (identity.server) {
      parsed.server = identity.server;
    }
    if (identity.url) {
      parsed.url = identity.url;
    }
  }
  if (Object.keys(parsed) !== 0) {
    console.log(parsed);
    console.log(window.location.pathname + '#' + queryString.stringify(parsed));
    try {
      window.history.replaceState({}, '', window.location.pathname + '#' + queryString.stringify(parsed));
    } catch(e) {
      console.log(e);
    }
  }
}
