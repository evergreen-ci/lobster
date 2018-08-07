// @flow strict

import type { Action } from '../actions';
import { LOGVIEWER_TOGGLE_SETTINGS_PANEL } from '../actions/logviewer';

const initialState = false;

export default function(state: boolean = initialState, action: Action): boolean {
  if (action.type === LOGVIEWER_TOGGLE_SETTINGS_PANEL) {
    return !state;
  }

  return state;
}
