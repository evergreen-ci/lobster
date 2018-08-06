import search from './search';

test('selectors-search', function() {
  const lines = [
    { lineNumber: 0, text: "line 0"},
    { lineNumber: 1, text: "line 1"},
    { lineNumber: 2, text: "line 2"},
    { lineNumber: 3, text: "line 3"},
    { lineNumber: 4, text: "line 4"},
    { lineNumber: 5, text: "line 5"},
  ];

  let state = {
    log: {
      lines: lines,
    },
    logviewer: {
      find: {
        text: '',
      },
      filters: [
        { on: true, text: "Line ", inverse: false },
        { on: true, text: "Line 4", inverse: false },
      ],
      bookmarks: [
        { lineNumber: 0 },
        { lineNumber: 5 },
      ],
      settings: {
        caseSensitive: false,
        filterIntersection: false
      }
    },
  };

  expect(search(state)).toHaveLength(6);

  state.logviewer.settings = {
    ...state.logviewer.settings,
    caseSensitive: true
  }
  expect(search(Object.assign({}, state))).toHaveLength(2);

  state.logviewer.settings = {
    ...state.logviewer.settings,
    caseSensitive: false,
    filterIntersection: true
  }
  expect(search(Object.assign({}, state))).toHaveLength(3);

  state.logviewer.filters = [
    { on: false, text: "line ", inverse: true },
    { on: true, text: "Line 4", inverse: false },
  ];
  expect(search(Object.assign({}, state))).toHaveLength(3);
});
