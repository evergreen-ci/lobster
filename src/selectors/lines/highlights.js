// @flow strict

import { createSelector } from 'reselect';
import shouldLineMemoizer from './shouldLineMemoizer';
import type { Line, Highlight, Settings } from '../../models';

function matchFilters(filter: RegExp[], string: string, isIntersection: boolean): boolean {
  if (isIntersection) {
    return filter.every(regex => string.match(regex));
  }
  return filter.some(regex => string.match(regex));
}

export const shouldHighlightLine = shouldLineMemoizer(
  function(line: Line, highlight: RegExp[], highlightLine: RegExp[], settings: Settings): boolean {
    if (!highlight || highlight.length === 0) {
      return false;
    }
    if (matchFilters(highlight, line.text, settings.filterIntersection) && matchFilters(highlightLine, line.text, settings.filterIntersection)) {
      return true;
    }
    return false;
  }
);

export const getHighlightText = createSelector(
  (s) => s,
  function(highlightList: Highlight[]): string[] {
    const highlight = [];
    highlightList.forEach((element) => {
      if (element.on && !element.line) {
        highlight.push(element.text);
      }
    });
    return highlight;
  }
);
