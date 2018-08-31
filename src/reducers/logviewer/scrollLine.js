// @flow strict

import { type Action, LOGVIEWER_SCROLL_TO_LINE } from '../../actions';

export default function(state: number = 0, action: Action): number {
  if (action.type === LOGVIEWER_SCROLL_TO_LINE) {
    return action.payload.line;
  }

  return state;
}
