// @flow strict

import { LOGVIEWER_CHANGE_SETTING, type Action } from '../../actions/logviewer';
import type { Settings } from '../../models';

const initialState: Settings = {
  wrap: window.localStorage.getItem('lobster-line-wrap') === 'true',
  caseSensitive: false,
  filterIntersection: false
};

export default function(state: Settings = initialState, action: Action): Settings {
  if (action.type !== LOGVIEWER_CHANGE_SETTING || action.payload.value !== 'toggle') {
    return state;
  }

  if (action.payload.setting === 'line-wrap') {
    window.localStorage.setItem('lobster-line-wrap', !state.wrap);
    return { ...state, wrap: !state.wrap };
  }

  if (action.payload.setting === 'case-sensitive') {
    return { ...state, caseSensitive: !state.caseSensitive };
  }

  if (action.payload.setting === 'filter-intersection') {
    return { ...state, filterIntersection: !state.filterIntersection };
  }

  return state;
}
