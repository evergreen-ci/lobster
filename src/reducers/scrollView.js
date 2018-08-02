// @flow strict

import { LOGVIEWER_CLEAR_LINE_LIST, LOGVIEWER_ADD_LINE } from '../actions/logviewer';
import type { Action } from '../actions';
import type { ScrollView } from '../models';

// $FlowFixMe
const TIME_RE = new RegExp(String.raw`(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d{3})`);
const MONGO_TS_PREFIX_LENGTH = ('2017-01-23T19:51:55.058').length;

const lineToDate = {};

const initialState = {
  startDate: null,
  endDate: null
};

function getDate(text: string, line: number): ?Date {
  if (Object.keys(lineToDate).includes(line)) {
    return lineToDate[line];
  }
  const splits = text.split(' ');
  if (splits != null) {
    const match = TIME_RE.exec(splits[1].substring(0, MONGO_TS_PREFIX_LENGTH));
    if (match) {
      lineToDate[line] = new Date(Date.UTC(match[1], match[2] - 1, match[3], match[4], match[5], match[6], match[7]));
      return lineToDate[line];
    }
  }
  return null;
}

export default function(state: ScrollView = initialState, action: Action): ScrollView {
  if (action.type === LOGVIEWER_CLEAR_LINE_LIST) {
    return ({ startDate: null, endDate: null });
  }
  if (action.type === LOGVIEWER_ADD_LINE) {
    const date = getDate(action.payload.text, action.payload.line);
    if (date == null) {
      return state;
    }
    if (state.startDate == null) {
      return {
        startDate: date,
        endDate: date
      };
    }
    return {
      startDate: date < state.startDate ? date : state.startDate,
      endDate: date > state.endDate ? date : state.endDate
    };
  }
  return state;
}
