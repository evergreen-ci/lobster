// @flow

import { getHighlightText, shouldHighlightLine, mergeActiveHighlights, mergeActiveHighlightLines } from './highlights';

test('selectors-shouldHighlightLine', function() {
  const lines = [
    { lineNumber: 0, text: 'line 0', port: null, gitRef: null },
    { lineNumber: 1, text: 'line 1', port: null, gitRef: null },
    { lineNumber: 2, text: 'line 2', port: null, gitRef: null },
    { lineNumber: 3, text: 'line 3', port: null, gitRef: null },
    { lineNumber: 4, text: 'line 4', port: null, gitRef: null },
    { lineNumber: 5, text: 'line 5', port: null, gitRef: null }
  ];

  const highlights = [
    { on: true, text: 'Line ', line: true },
    { on: true, text: 'Line 4', line: false }
  ];

  const settings = {
    filterIntersection: false,
    wrap: false,
    caseSensitive: false,
  };

  let highlightRegexps = mergeActiveHighlights(highlights);
  let highlightLinesRegexp = mergeActiveHighlightLines(highlights);
  lines.forEach((line) => expect(shouldHighlightLine(line, highlightRegexps, highlightLinesRegexp, settings)).toBe(true));


  highlightRegexps = mergeActiveHighlights(highlights);
  highlightLinesRegexp = mergeActiveHighlightLines(highlights);
  lines.forEach((line) => expect(shouldHighlightLine(line, highlightRegexps, highlightLinesRegexp, settings)).toBe(false));

  highlights[0].on = false;
  highlightRegexps = mergeActiveHighlights(highlights);
  highlightLinesRegexp = mergeActiveHighlightLines(highlights);
  lines.forEach((line) => expect(shouldHighlightLine(line, highlightRegexps, highlightLinesRegexp, settings)).toBe(false));

  highlights[1].line = true;
  [lines[0], lines[2], lines[3], lines[4], lines[5]].forEach((line) => expect(shouldHighlightLine(line, highlightRegexps, highlightLinesRegexp, settings)).toBe(false));
});

test('selectors-getHighlightText', function() {
  const highlights = [
    { on: true, text: 'Line ', line: true },
    { on: true, text: 'Line 4', line: false }
  ];

  expect(getHighlightText(highlights)).toEqual(expect.arrayContaining(['Line 4']));
});
