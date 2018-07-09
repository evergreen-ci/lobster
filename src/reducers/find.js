// @flow strict

import { CHANGE_FINDIDX, CHANGE_SEARCH } from '../actions';
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
  if (action.type === CHANGE_FINDIDX) {
    return {...state, findIdx: action.payload.index};
  }
  if (action.type === CHANGE_SEARCH) {
    return {...state, searchRegex: action.payload.text};
  }
  return state;
}
