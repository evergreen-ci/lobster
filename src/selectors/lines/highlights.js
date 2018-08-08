// @flow strict

import { createSelector } from 'reselect';
import type { Line, Highlight, Settings } from '../../models';

function matchFilters(filter: RegExp[], string: string, isIntersection: boolean): boolean {
  if (isIntersection) {
    return filter.every(regex => string.match(regex));
  }
  return filter.some(regex => string.match(regex));
}

export function shouldHighlightLine(line: Line, highlight: RegExp[], highlightLine: RegExp[], settings: Settings): boolean {
  if (!highlight || highlight.length === 0) {
    return false;
  }
  if (matchFilters(highlight, line.text, settings.filterIntersection) && matchFilters(highlightLine, line.text, settings.filterIntersection)) {
    return true;
  }
  return false;
}

export function mergeActiveHighlights(highlightList: Highlight[], caseSensitive: boolean): RegExp[] {
  return highlightList
    .filter((elem) => elem.on)
    .map((elem) => caseSensitive ? new RegExp(elem.text) : new RegExp(elem.text, 'i'));
}

export function mergeActiveHighlightLines(highlightList: Highlight[], caseSensitive: boolean): RegExp[] {
  return highlightList
    .filter((elem) => elem.on && elem.line)
    .map((elem) => caseSensitive ? new RegExp(elem.text) : new RegExp(elem.text, 'i'));
}

export function getHighlightText(highlightList: Highlight[]): string[] {
  const highlight = [];
  highlightList.forEach((element) => {
    if (element.on && !element.line) {
      highlight.push(element.text);
    }
  });
  return highlight;
}
