// @flow strict

import * as actions from "../actions";
import {
  type SearchEvent,
  type ChangeSearch,
  LOGVIEWER_SEARCH_EVENT,
  LOGVIEWER_CHANGE_SEARCH,
} from "../actions";
import { put, select } from "redux-saga/effects";
import type { Saga } from "redux-saga";
import { getFindResults, getLogViewerFindIdx } from "../selectors";

export default function* (action: SearchEvent | ChangeSearch): Saga<void> {
  const findResults = yield select(getFindResults);
  const numLines = findResults.length;
  if (numLines === 0) {
    yield put(actions.changeFindIdx(-1));
    return;
  }

  const findIndex = yield select(getLogViewerFindIdx);

  if (action.type === LOGVIEWER_CHANGE_SEARCH) {
    if (action.payload.text === "") {
      yield put(actions.changeFindIdx(-1));
    } else {
      if (findIndex === -1) {
        yield put(actions.changeFindIdx(0));
      }
    }
  } else if (action.type === LOGVIEWER_SEARCH_EVENT) {
    if (action.payload.action === "next") {
      let newIdx = findIndex + 1;
      if (newIdx >= numLines) {
        newIdx = 0;
      }
      yield put(actions.changeFindIdx(newIdx));
    } else if (action.payload.action === "prev") {
      let newIdx = findIndex - 1;
      if (newIdx < 0) {
        newIdx = numLines - 1;
      }

      yield put(actions.changeFindIdx(newIdx));
    }
  }
}
