// @flow strict

import { LOGVIEWER_CHANGE_FILTER, LOGVIEWER_LOAD_FILTERS } from '../actions/logviewer';
import type { Action } from '../actions';
import type { Filter } from '../actions/logviewer';

const initialState: Filter[] = [];

export default function(state: Filter[] = initialState, action: Action): Filter[] {
  if (action.type === LOGVIEWER_LOAD_FILTERS) {
    return action.payload.initialFilters;
  }

  if (action.type !== LOGVIEWER_CHANGE_FILTER) {
    return state;
  }

  if (action.payload.field === 'on') {
    return state.map(filter =>
      (filter.text === action.payload.text) ? {...filter, on: !filter.on} : filter);
  }

  if (action.payload.field === 'inverse') {
    return state.map(filter =>
      (filter.text === action.payload.text) ? {...filter, inverse: !filter.inverse} : filter);
  }

  if (action.payload.field === 'remove') {
    return state.filter(filter =>
      (filter.text !== action.payload.text));
  }

  if (action.payload.field === 'add') {
    return [
      ...state,
      {
        text: action.payload.text,
        on: true,
        inverse: false
      }
    ];
  }

  return state;
}
