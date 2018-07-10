// @flow strict

import { CHANGE_HIGHLIGHT, LOAD_HIGHLIGHTS } from '../actions';
import type { Action } from '../actions';
import type { Highlight } from '../actions';

const initialState: Highlight[] = [];

export default function(state: Highlight[] = initialState, action: Action): Highlight[] {
  if (action.type === LOAD_HIGHLIGHTS) {
    return action.payload.initialHighlights;
  }

  if (action.type !== CHANGE_HIGHLIGHT) {
    return state;
  }

  if (action.payload.field === 'on') {
    return state.map(highlight =>
      (highlight.text === action.payload.text) ? {...highlight, on: !highlight.on} : highlight);
  }

  if (action.payload.field === 'line') {
    return state.map(highlight =>
      (highlight.text === action.payload.text) ? {...highlight, line: !highlight.line} : highlight);
  }

  if (action.payload.field === 'remove') {
    return state.filter(highlight =>
      (highlight.text !== action.payload.text));
  }

  if (action.payload.field === 'add') {
    return [
      ...state,
      {
        text: action.payload.text,
        on: true,
        line: false
      }
    ];
  }

  return state;
}
