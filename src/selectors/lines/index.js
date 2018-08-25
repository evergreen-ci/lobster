// @flow strict

import { createSelector } from 'reselect';
import type { ReduxState, Line, LineData, Filter, Highlight, Bookmark, Settings } from '../../models';
import { shouldPrintLine, mergeActiveFilters, mergeActiveInverseFilters } from './search';
import { getHighlightText, shouldHighlightLine, mergeActiveHighlights, mergeActiveHighlightLines } from './highlights';
import * as selectors from '../basic';

function makeRegexp(regexp: ?string, caseSensitive: boolean): ?RegExp {
  try {
    if (regexp == null || regexp === '') {
      return new RegExp('');
    }

    if (!caseSensitive) {
      return new RegExp(regexp, 'i');
    }
    return new RegExp(regexp);
  } catch (_e) {
    return null;
  }
}

const getFilteredLineData = createSelector(
  selectors.getLogViewerSearchTerm,
  selectors.getLogLines,
  selectors.getLogViewerFilters,
  selectors.getLogViewerHighlights,
  selectors.getLogViewerBookmarks,
  selectors.getLogViewerSettings,
  function(searchTerm: ?string, lines: Line[], filters: Filter[], highlights: Highlight[], bookmarks: Bookmark[], settings: Settings): LineData {
    const findRegexp = makeRegexp(searchTerm, settings.caseSensitive);
    const filter = mergeActiveFilters(filters);
    const inverseFilter = mergeActiveInverseFilters(filters);
    const highlight = mergeActiveHighlights(highlights);
    const highlightLine = mergeActiveHighlightLines(highlights);
    const highlightText = getHighlightText(highlights);

    const indexMap = new Map();
    const highlightLines = [];
    const findResults = [];
    const filteredLines = [];

    let j = 0;
    lines.forEach((line, i) => {
      if (!shouldPrintLine(bookmarks, line, settings.filterIntersection, filter, inverseFilter)) {
        return;
      }
      filteredLines.push(line);
      if (findRegexp != null && findRegexp.test(line.text)) {
        findResults.push(line.lineNumber);
      }
      indexMap.set(i, j++);
      if (highlight.length > 0
        && shouldHighlightLine(line, highlight, highlightLine, settings)) {
        highlightLines.push(line);
      }
    });

    return {
      indexMap: indexMap,
      findResults: findResults,
      filteredLines: filteredLines,
      highlightLines: highlightLines,
      highlightText: highlightText
    };
  }
);

export default function(state: ReduxState) {
  return getFilteredLineData(state);
}
