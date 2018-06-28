// @flow strict

import { CHANGE_FILTER, LOAD_FILTERS } from '../actions';
import type { Action } from '../actions';

export type Filters = {|
  +text: string,
  +on: boolean,
  +inverse: boolean
|}

const initialState: Filters[] = [];

export default function(state: Filters = initialState, action: Action): Settings {
  if (action.type === LOAD_FILTERS) {
    return action.payload.initialFilters;
  }

  if (action.type !== CHANGE_FILTER) {
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
