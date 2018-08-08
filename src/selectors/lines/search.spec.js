import { shouldPrintLine, mergeActiveFilters, mergeActiveInverseFilters } from './search';

test('selectors-shouldPrintLine', function() {
  const lines = [
    { lineNumber: 0, text: 'line 0' },
    { lineNumber: 1, text: 'line 1' },
    { lineNumber: 2, text: 'line 2' },
    { lineNumber: 3, text: 'line 3' },
    { lineNumber: 4, text: 'line 4' },
    { lineNumber: 5, text: 'line 5' }
  ];

  const filters = [
    { on: true, text: 'Line ', inverse: false },
    { on: true, text: 'Line 4', inverse: false }
  ];
  const bookmarks = [
    { lineNumber: 0 },
    { lineNumber: 5 }
  ];
  let filtersRegexps = mergeActiveFilters(filters, false);
  let inverseFilters = mergeActiveInverseFilters(filters, false);

  lines.forEach((line) => expect(shouldPrintLine(bookmarks, line, false, filtersRegexps, inverseFilters)).toBe(true));

  filtersRegexps = mergeActiveFilters(filters, true);
  inverseFilters = mergeActiveInverseFilters(filters, true);
  [lines[0], lines[5]].forEach((line) => expect(shouldPrintLine(bookmarks, line, false, filtersRegexps, inverseFilters)).toBe(true));
  [lines[1], lines[2], lines[3], lines[4]].forEach((line) => expect(shouldPrintLine(bookmarks, line, false, filtersRegexps, inverseFilters)).toBe(false));

  [lines[0], lines[5]].forEach((line) => expect(shouldPrintLine(bookmarks, line, true, filtersRegexps, inverseFilters)).toBe(true));
  [lines[1], lines[2], lines[3], lines[4]].forEach((line) => expect(shouldPrintLine(bookmarks, line, true, filtersRegexps, inverseFilters)).toBe(false));


  filters[0].on = false;
  filters[0].inverse = true;
  filtersRegexps = mergeActiveFilters(filters, false);
  inverseFilters = mergeActiveInverseFilters(filters, false);
  [lines[0], lines[4], lines[5]].forEach((line) => expect(shouldPrintLine(bookmarks, line, true, filtersRegexps, inverseFilters)).toBe(true));
  [lines[1], lines[2], lines[3]].forEach((line) => expect(shouldPrintLine(bookmarks, line, true, filtersRegexps, inverseFilters)).toBe(false));
});
