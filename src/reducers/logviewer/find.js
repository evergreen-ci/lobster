// @flow strict

import { LOGVIEWER_CHANGE_FINDIDX, LOGVIEWER_CHANGE_SEARCH, LOGVIEWER_CHANGE_HIGHLIGHT, LOGVIEWER_CHANGE_FILTER, LOGVIEWER_CHANGE_START_RANGE, LOGVIEWER_CHANGE_END_RANGE, type Action } from '../../actions';
import type { Find } from '../../models';

const initialState: Find = {
  findIdx: -1,
  searchTerm: '',
  regexError: null,
  startRange: 0,
  endRange: -1
};

export default function(state: Find = initialState, action: Action): Find {
  if (action.type === LOGVIEWER_CHANGE_HIGHLIGHT || action.type === LOGVIEWER_CHANGE_FILTER) {
    return { ...state, searchTerm: '' };
  }
  if (action.type === LOGVIEWER_CHANGE_FINDIDX) {
    return { ...state, findIdx: action.payload.index };
  }
  if (action.type === LOGVIEWER_CHANGE_SEARCH) {
    const { text } = action.payload;
    if (!text) {
      return { ...state, searchTerm: '', findIdx: -1 };
    }
    try {
      RegExp(text);
      return {
        ...state,
        regexError: null,
        searchTerm: text
      };
    } catch (e) {
      return {
        ...state,
        searchTerm: text,
        regexError: e,
        findIdx: -1
      };
    }
  }
  if (action.type === LOGVIEWER_CHANGE_START_RANGE) {
    const start = action.payload.start;
    if (isNaN(start)) {
      return { ...state, startRange: 0 };
    }
    return { ...state, startRange: start };
  }
  if (action.type === LOGVIEWER_CHANGE_END_RANGE) {
    const end = action.payload.end;
    if (isNaN(end)) {
      return { ...state, endRange: -1 };
    }
    return { ...state, endRange: end };
  }
  return state;
}
