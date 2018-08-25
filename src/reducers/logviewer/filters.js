// @flow strict

import { LOGVIEWER_CHANGE_FILTER, LOGVIEWER_LOAD_FILTERS, type Action } from '../../actions';
import type { Filter } from '../../models';

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
      (filter.text === action.payload.text) ? { ...filter, on: !filter.on } : filter);
  }

  if (action.payload.field === 'inverse') {
    return state.map(filter =>
      (filter.text === action.payload.text) ? { ...filter, inverse: !filter.inverse } : filter);
  }

  if (action.payload.field === 'remove') {
    return state.filter(filter =>
      (filter.text !== action.payload.text));
  }

  if (action.payload.field === 'caseSensitive') {
    return state.map(filter =>
      (filter.text === action.payload.text) ? { ...filter, caseSensitive: !filter.caseSensitive} : filter);
  }

  if (action.payload.field === 'add') {
    for (let i = 0; i < state.length; ++i) {
      if (action.payload.text === state[i].text) {
        return state;
      }
    }
    return [
      ...state,
      {
        text: action.payload.text,
        on: true,
        inverse: false,
        caseSensitive: action.payload.caseSensitive || false
      }
    ];
  }

  return state;
}
