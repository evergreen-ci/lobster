// @flow strict

import { LOGVIEWER_PRETTY_PRINT, type Action } from '../../actions';
import type { PrettyPrint } from '../../models';

const initialState: PrettyPrint = {
    text: '',
    caseSensitive: false
};

export default function(state: PrettyPrint = initialState, action: Action): PrettyPrint {
  if (action.type !== LOGVIEWER_PRETTY_PRINT) {
    return state;
  }
  console.log('is this actually gonna print lol');

//   if (action.payload.field === 'on') {
//     return state.map(highlight =>
//       (highlight.text === action.payload.text) ? { ...highlight, on: !highlight.on } : highlight);
//   }

//   if (action.payload.field === 'line') {
//     return state.map(highlight =>
//       (highlight.text === action.payload.text) ? { ...highlight, line: !highlight.line } : highlight);
//   }

//   if (action.payload.field === 'remove') {
//     return state.filter(highlight =>
//       (highlight.text !== action.payload.text));
//   }

//   if (action.payload.field === 'caseSensitive') {
//     return state.map(highlight =>
//       (highlight.text === action.payload.text) ? { ...highlight, caseSensitive: !highlight.caseSensitive } : highlight);
//   }

//   if (action.payload.field === 'add') {
//     for (let i = 0; i < state.length; ++i) {
//       if (action.payload.text === state[i].text) {
//         return state;
//       }
//     }
//     return [
//       ...state,
//       {
//         text: action.payload.text,
//         on: true,
//         line: false,
//         caseSensitive: action.payload.caseSensitive || false
//       }
//     ];
//   }

  return state;
}
