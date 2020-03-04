// @flow strict

import { LOGVIEWER_CHANGE_SETTING, type Action } from '../../actions/logviewer';
import type { Settings } from '../../models';

const expandableRowsLocalSetting = window.localStorage.getItem('lobster-expandable-rows')

const initialState: Settings = {
  wrap: window.localStorage.getItem('lobster-line-wrap') === 'true',
  caseSensitive: false,
  filterIntersection: true,
  parseResmokeJson: true,
  expandableRows: expandableRowsLocalSetting === null ? true : // Enabled by default
                  expandableRowsLocalSetting === 'true' // when opt set, use local setting
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

  if (action.payload.setting === 'parse-resmoke-json') {
    return { ...state, parseResmokeJson: !state.parseResmokeJson };
  }

  if (action.payload.setting === 'expandable-rows') {
    window.localStorage.setItem('lobster-expandable-rows', !state.expandableRows);
    return { ...state, expandableRows: !state.expandableRows };
  }

  return state;
}
