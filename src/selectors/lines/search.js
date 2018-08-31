// @flow strict

import { createSelector } from 'reselect';
import * as selectors from '../basic';
import getFilteredLineData from './filter';
import type { FilteredLineData, SearchResults } from '../../models';

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
  function(searchTerm: string, lineData: FilteredLineData, caseSensitive: boolean): SearchResults {
    const { filteredLines } = lineData;
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
