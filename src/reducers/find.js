// @flow strict

import { LOGVIEWER_CHANGE_FINDIDX, LOGVIEWER_CHANGE_SEARCH } from '../actions/logviewer';
import type { Action } from '../actions';
import type { Find } from '../models';

const initialState: Find = {
  findIdx: -1,
  searchTerm: null
};

export default function(state: Find = initialState, action: Action): Find {
  if (action.type === LOGVIEWER_CHANGE_FINDIDX) {
    return { ...state, findIdx: action.payload.index };
  }
  if (action.type === LOGVIEWER_CHANGE_SEARCH) {
    const { text } = action.payload;
    if (text === '') {
      return { ...state, searchTerm: null };
    }
    return {
      ...state,
      searchTerm: {
        term: text,
        regex: new RegExp(text)
      }
    };
  }
  return state;
}
