// @flow strict

import { createSelector } from 'reselect';
import type { ReduxState, Line, FilteredLineData, Filter, Bookmark } from '../../models';
import * as merge from './merge';
import * as selectors from '../basic';

function findBookmark(bookmarkList: Bookmark[], lineNum: number): number {
  return bookmarkList.findIndex(function(bookmark) {
    return bookmark.lineNumber === lineNum;
  });
}

function matchFilters(filter: RegExp[], string: string, isIntersection: boolean): boolean {
  if (isIntersection) {
    return filter.every(regex => string.match(regex));
  }
  return filter.some(regex => string.match(regex));
}

export const shouldPrintLine = function(line: Line, bookmarks: Bookmark[], filterIntersection: boolean, filter: RegExp[], inverseFilter: RegExp[]): boolean {
  if (findBookmark(bookmarks, line.lineNumber) !== -1) {
    return true;
  }

  if ((!filter && !inverseFilter) || (filter.length === 0 && inverseFilter.length === 0)) {
    return true;
  } else if (!filter || filter.length === 0) {
    if (matchFilters(inverseFilter, line.text, filterIntersection)) {
      return false;
    }
    return true;
  } else if (!inverseFilter || inverseFilter.length === 0) {
    if (matchFilters(filter, line.text, filterIntersection)) {
      return true;
    }
    return false;
  }
  // If there are both types of filters, it has to match the filter and not match
  // the inverseFilter.
  if (filterIntersection) {
    if (matchFilters(filter, line.text, filterIntersection) &&
            !matchFilters(inverseFilter, line.text, filterIntersection)) {
      return true;
    }
  } else if (matchFilters(filter, line.text, filterIntersection) ||
          !matchFilters(inverseFilter, line.text, filterIntersection)) {
    return true;
  }
  return false;
};


const getFilteredLineData = createSelector(
  selectors.getLogLines,
  selectors.getLogViewerFilters,
  selectors.getLogViewerBookmarks,
  selectors.getLogViewerSettingsFilterLogic,
  function(lines: Line[], filters: Filter[], bookmarks: Bookmark[], filterIntersection: boolean): FilteredLineData {
    console.log('filters-selector');
    const filter = merge.activeFilters(filters);
    const inverseFilter = merge.activeInverseFilters(filters);

    const indexMap = new Map();

    let j = 0;
    const filteredLines = lines.filter((line, i) => {
      if (!shouldPrintLine(line, bookmarks, filterIntersection, filter, inverseFilter)) {
        return false;
      }

      indexMap.set(i, j++);
      return true;
    });

    return {
      indexMap: indexMap,
      filteredLines: filteredLines
    };
  }
);

export default function(state: ReduxState) {
  return getFilteredLineData(state);
}
