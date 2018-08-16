// @flow strict

import { LOGVIEWER_CHANGE_FINDIDX, LOGVIEWER_CHANGE_SEARCH, LOGVIEWER_CHANGE_HIGHLIGHT, LOGVIEWER_CHANGE_FILTER, type Action } from '../../actions';
import type { Find } from '../../models';

const initialState: Find = {
  findIdx: -1,
  searchTerm: '',
  regexError: null
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
      return { ...state, searchTerm: '' };
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
        regexError: e
      };
    }
  }
  return state;
}
