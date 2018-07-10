// @flow strict

import { LOGVIEWER_CHANGE_SETTING } from '../actions';
import type { Action } from '../actions';

export type Settings = {|
  +wrap: boolean,
  +caseSensitive: boolean,
  +filterIntersection: boolean
|}

const initialState: Settings = {
  wrap: false,
  caseSensitive: false,
  filterIntersection: false
};

export default function(state: Settings = initialState, action: Action): Settings {
  if (action.type !== LOGVIEWER_CHANGE_SETTING || action.payload.value !== 'toggle') {
    return state;
  }

  if (action.payload.setting === 'line-wrap') {
    return {...state, wrap: !state.wrap};
  }

  if (action.payload.setting === 'case-sensitive') {
    return {...state, caseSensitive: !state.caseSensitive};
  }

  if (action.payload.setting === 'filter-intersection') {
    return {...state, filterIntersection: !state.filterIntersection};
  }

  return state;
}
