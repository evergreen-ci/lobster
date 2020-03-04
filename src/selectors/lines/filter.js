// @flow strict

import { createSelector } from 'reselect';
import type { ReduxState, Line, Filter, Bookmark } from '../../models';
import { parseLogLine } from './transforms';
import * as merge from './merge';
import * as selectors from '../basic';

function findBookmark(bookmarkList: Bookmark[], lineNum: number): number {
  return bookmarkList.findIndex(function(bookmark) {
    return bookmark.lineNumber === lineNum;
  });
}

// Apply list of inclusionary filters to a string
// :param filter: list of filters (predicates)
// :param string: line of text
// :param isIntersection: predicate operator True = AND, False = OR
function matchFilters(filter: RegExp[], string: string, isIntersection: boolean): boolean {
  if (isIntersection) {
    return filter.every(regex => string.match(regex));
  }
  return filter.some(regex => string.match(regex));
}

// Sibling of matchFilters
// Should be used for exclusionary filters
// :param filter: list of filters (predicates)
// :param string: line of text
// :param isIntersection: predicate operator True = AND, False = OR
function inverseMatchFilters(filter: RegExp[], string: string, isIntersection: boolean): boolean {
  if (isIntersection) {
    return filter.every(regex => !string.match(regex));
  }
  return filter.some(regex => !string.match(regex));
}

// Tells if the line matches all filters
// :param line: line of text
// :param bookmarks: TODO
// :param filterIntersection: predicate operator True = AND, False = OR
// :param filter: list of inclusionary filters
// :param inverseFilter: list of exlusionary filters
export const shouldPrintLine = function(line: Line, bookmarks: Bookmark[], filterIntersection: boolean, filter: RegExp[], inverseFilter: RegExp[]): boolean {
  if (findBookmark(bookmarks, line.lineNumber) !== -1) {
    return true;
  }

  if ((!filter && !inverseFilter) || (filter.length === 0 && inverseFilter.length === 0)) {
    return true;
  } else if (!filter || filter.length === 0) {
    return inverseMatchFilters(inverseFilter, line.text, filterIntersection)
  } else if (!inverseFilter || inverseFilter.length === 0) {
    return matchFilters(filter, line.text, filterIntersection)
  }

  const hasInclusionaryMatch = matchFilters(filter, line.text, filterIntersection)
  const hasExclusionaryMatch  = inverseMatchFilters(inverseFilter, line.text, filterIntersection)

  // If there are both types of filters, it has to match the filter and not match
  // the inverseFilter.
  // For AND operator
  if (filterIntersection) {
    if (hasInclusionaryMatch && hasExclusionaryMatch) {
      return true;
    }
  // For OR operator
  } else if (hasInclusionaryMatch || hasExclusionaryMatch) {
    return true;
  }
  return false;
};

const getFilteredLineData = createSelector(
  selectors.getLogLines,
  selectors.getLogViewerFilters,
  selectors.getLogViewerBookmarks,
  selectors.getLogViewerSettingsFilterLogic,
  selectors.getLogViewerSettingsParseJson,
  function(lines: Line[], filters: Filter[], bookmarks: Bookmark[], filterIntersection: boolean, parseResmokeJson: boolean): Line[] {
    const filter = merge.activeFilters(filters);
    const inverseFilter = merge.activeInverseFilters(filters);

    lines.forEach((line) => {
      if (!shouldPrintLine(line, bookmarks, filterIntersection, filter, inverseFilter)) {
        line.isMatched = false
      } else {
        line.isMatched = true
      }
      if (parseResmokeJson) {
        line.text = parseLogLine(line.originalText);
      } else {
        line.text = line.originalText;
      }
    });

    return lines
  }
);

export default function(state: ReduxState) {
  return getFilteredLineData(state);
}
