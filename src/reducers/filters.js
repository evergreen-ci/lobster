// @flow strict

import { CHANGE_FILTER } from '../actions';
import type { Action } from '../actions';

export type Filters = {|
  +text: string,
  +on: boolean,
  +inverse: boolean
|}

const initialState: Filters = {
  text: '',
  on: false,
  inverse: false
};

export default function(state: Filters = initialState, action: Action): Settings {
  if (action.type !== CHANGE_FILTER) {
    return state;
  }

  if (action.payload.field === 'on') {
    return {...state, on: !state.on};
  }

  if (action.payload.setting === 'inverse') {
    return {...state, inverse: !state.inverse};
  }

  return state;
}
