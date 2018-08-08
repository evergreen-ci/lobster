// @flow

import highlights from './highlights';

test('selectors-highlights', function() {
  const lines = [
    { lineNumber: 0, text: 'line 0', port: null, gitRef: null },
    { lineNumber: 1, text: 'line 1', port: null, gitRef: null },
    { lineNumber: 2, text: 'line 2', port: null, gitRef: null },
    { lineNumber: 3, text: 'line 3', port: null, gitRef: null },
    { lineNumber: 4, text: 'line 4', port: null, gitRef: null },
    { lineNumber: 5, text: 'line 5', port: null, gitRef: null }
  ];

  const state = {
    log: {
      lines: lines
    },
    logviewer: {
      highlights: [
        { on: true, text: 'Line ', line: true },
        { on: true, text: 'Line 4', line: false }
      ],
      settings: {
        filterIntersection: false,
        wrap: false,
        caseSensitive: false
      }
    }
  };

  expect(highlights(state)).toHaveLength(6);

  state.logviewer.settings = {
    ...state.logviewer.settings,
    caseSensitive: true
  };
  expect(highlights(Object.assign({}, state))).toHaveLength(0);

  state.logviewer.settings = {
    ...state.logviewer.settings,
    caseSensitive: false
  };
  state.logviewer.highlights[0].on = false;
  expect(highlights(Object.assign({}, state))).toHaveLength(0);

  state.logviewer.highlights[1].line = true;
  expect(highlights(Object.assign({}, state))).toHaveLength(1);
});
