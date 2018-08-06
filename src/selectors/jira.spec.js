import jira from './jira';

test('selectors-jira', function() {
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
      lines: lines
    },
    logviewer: {
      bookmarks: [],
    }
  };

  expect(jira(state)).toBe('');

  state = Object.assign({}, state)
  state.logviewer.bookmarks = [
    {lineNumber: 0},
    {lineNumber: 3},
    {lineNumber: 5},
    {lineNumber: 7},
  ];

  expect(jira(state)).toEqual(expect.stringContaining('line 5'));
  expect(jira(state)).not.toEqual(expect.stringContaining('line 1'));
  expect(jira(state)).not.toEqual(expect.stringContaining('line 6'));
  expect(jira(state)).not.toEqual(expect.stringContaining('line 7'));
  expect(jira(state)).toMatchSnapshot();
})
