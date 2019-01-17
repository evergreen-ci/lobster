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
  function(searchTerm: string, lines: Array<Line>, caseSensitive: boolean): SearchResults {
    const filteredLines = lines;
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
