// @flow strict

import { createSelector } from 'reselect';
import type { ReduxState, Line, LineData, Filter, Highlight, Bookmark, Settings } from '../../models';
import { shouldPrintLine } from './search';
import * as merge from './merge';
import { getHighlightText, shouldHighlightLine } from './highlights';
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
    const filter = merge.activeFilters(filters);
    const inverseFilter = merge.activeInverseFilters(filters);
    const highlight = merge.activeHighlights(highlights);
    const highlightLine = merge.activeHighlightLines(highlights);
    const highlightText = getHighlightText(highlights);

    const indexMap = new Map();
    const highlightLines = [];
    const findResults = [];
    const filteredLines = [];

    let j = 0;
    for (let i = 0; i < lines.length; ++i) {
      if (!shouldPrintLine(lines[i], bookmarks, settings.filterIntersection, filter, inverseFilter)) {
        continue;
      }
      filteredLines.push(lines[i]);
      if (findRegexp != null && findRegexp.test(lines[i].text)) {
        findResults.push(lines[i].lineNumber);
      }
      indexMap.set(i, j++);
      if (highlight.length > 0
        && shouldHighlightLine(lines[i], highlight, highlightLine, settings)) {
        highlightLines.push(lines[i]);
      }
    }

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
