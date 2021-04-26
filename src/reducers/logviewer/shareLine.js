// @flow strict

import { type Action, LOGVIEWER_LOAD_SHARE_LINE } from "../../actions";

export default function (state: number = -1, action: Action): number {
  if (action.type === LOGVIEWER_LOAD_SHARE_LINE) {
    return action.payload.lineNum;
  }
  return state;
}
