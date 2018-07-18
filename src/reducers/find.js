// @flow strict

import { LOGVIEWER_CHANGE_FINDIDX, LOGVIEWER_CHANGE_SEARCH } from '../actions/logviewer';
import type { Action } from '../actions';

export type Find = {|
  +findIdx: number,
  +searchRegex: string
|}

const initialState: Find = {
  findIdx: -1,
  searchRegex: ''
};

export default function(state: Find = initialState, action: Action): Find {
  if (action.type === LOGVIEWER_CHANGE_FINDIDX) {
    return { ...state, findIdx: action.payload.index };
  }
  if (action.type === LOGVIEWER_CHANGE_SEARCH) {
    return { ...state, searchRegex: action.payload.text };
  }
  return state;
}
