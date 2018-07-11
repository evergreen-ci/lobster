// @flow strict

import { LOGVIEWER_CHANGE_HIGHLIGHT, LOGVIEWER_LOAD_HIGHLIGHTS } from '../actions/logviewer';
import type { Action } from '../actions/logviewer';
import type { Highlight } from '../actions/logviewer';

const initialState: Highlight[] = [];

export default function(state: Highlight[] = initialState, action: Action): Highlight[] {
  if (action.type === LOGVIEWER_LOAD_HIGHLIGHTS) {
    return action.payload.initialHighlights;
  }

  if (action.type !== LOGVIEWER_CHANGE_HIGHLIGHT) {
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
