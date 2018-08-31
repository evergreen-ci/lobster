// @flow strict

import { createSelector } from 'reselect';
import shouldLineMemoizer from './shouldLineMemoizer';
import * as selectors from '../basic';
import getFilteredLineData from './filter';
import type { FilteredLineData, Line, Bookmark, SearchResults } from '../../models';

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

export default createSelector(
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
