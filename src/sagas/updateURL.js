// @flow

import queryString from "../thirdparty/query-string";
import { select } from "redux-saga/effects";
import type { Saga } from "redux-saga";
import * as selectors from "../selectors";
import type { Highlight, Filter, LogIdentity } from "../models";

function boolToInt(b: boolean): string {
  return b ? "1" : "0";
}

function makeFilterURLString(filter: Filter): string {
  let res = "";
  res += boolToInt(filter.on);
  res += boolToInt(filter.inverse);
  res += boolToInt(filter.caseSensitive);
  res += "~";
  res += filter.text;
  return res;
}

function makeHighlightURLString(highlight: Highlight): string {
  let res = "";
  res += boolToInt(highlight.on);
  res += boolToInt(highlight.line);
  res += boolToInt(highlight.caseSensitive);
  res += "~";
  res += highlight.text;
  return res;
}

export default function* (): Saga<void> {
  const identity: LogIdentity = yield select(selectors.getLogIdentity);
  const filters = yield select(selectors.getLogViewerFilters);
  const highlights = yield select(selectors.getLogViewerHighlights);
  const bookmarks = yield select(selectors.getLogViewerBookmarks);
  const settings = yield select(selectors.getLogViewerSettings);
  const shareLine = yield select(selectors.getLogViewerShareLine);

  const parsed = {};
  parsed["f~"] = [];
  parsed["h~"] = [];
  for (let i = 0; i < filters.length; i++) {
    parsed["f~"].push(makeFilterURLString(filters[i]));
  }
  for (let i = 0; i < highlights.length; i++) {
    parsed["h~"].push(makeHighlightURLString(highlights[i]));
  }
  if (bookmarks.length > 0) {
    let bookmarkStr = "";
    for (let i = 0; i < bookmarks.length; i++) {
      bookmarkStr += bookmarks[i].lineNumber;
      if (i !== bookmarks.length - 1) {
        bookmarkStr += ",";
      }
    }
    parsed.bookmarks = bookmarkStr;
  }

  Object.keys(parsed)
    .filter((k) => {
      switch (typeof parsed[k]) {
        case "object":
          if (Array.isArray(parsed[k])) {
            return parsed[k].length === 0;
          }
          return Object.keys(parsed[k]) === 0;

        default:
          return parsed[k] == null;
      }
    })
    .forEach((k) => {
      delete parsed[k];
    });

  if (identity != null && identity.type === "lobster") {
    if (identity.server) {
      parsed.server = identity.server;
    }
    if (identity.url) {
      parsed.url = identity.url;
    }
  }
  if (settings.filterIntersection === true) {
    parsed.l = boolToInt(true);
  }

  if (shareLine > -1) {
    parsed.shareLine = shareLine;
  }
  if (Object.keys(parsed).length !== 0) {
    try {
      window.history.replaceState(
        {},
        "",
        window.location.pathname + "#" + queryString.stringify(parsed)
      );
    } catch (e) {
      console.error(e);
    }
  }
}
