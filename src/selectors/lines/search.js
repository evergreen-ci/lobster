// @flow strict

import { createSelector } from 'reselect';
import * as selectors from '../basic';
import getFilteredLineData from './filter';
import type { ReduxState, SearchResults, Line } from 'src/models';

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

const search = createSelector(
  selectors.getLogViewerSearchTerm,
  getFilteredLineData,
  selectors.getLogViewerSettingsCaseSensitive,
  selectors.getLogViewerSearchStartRange,
  selectors.getLogViewerSearchEndRange,
  function(searchTerm: string, lines: Line[], caseSensitive: boolean, startRange: number, endRange: number): SearchResults {
    let start = startRange;
    if (startRange < 0 || isNaN(startRange)) {
      start = 0;
    }
    let end = endRange;
    if (endRange < 0 || isNaN(endRange)) {
      end = lines.length;
    }
    const rangedLines = lines.slice(start, end);
    const filteredLines = rangedLines.filter((line) => {
      if (line.isMatched) {
        return true;
      }
      return false;
    });
    const findRegexp = makeRegexp(searchTerm, caseSensitive);
    if (findRegexp == null) {
      return [];
    }
    return filteredLines
      .filter((line) => findRegexp.test(line.text))
      .map((line) => line.lineNumber);
  }
);

export default function(state: ReduxState): SearchResults {
  return search(state);
}
