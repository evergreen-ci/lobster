// @flow

import { createSelector } from 'reselect';
import type { Line, Highlight, Settings } from '../models';

function matchFilters(filter: RegExp[], string: string, isIntersection: boolean): boolean {
  if (isIntersection) {
    return filter.every(regex => string.match(regex));
  }
  return filter.some(regex => string.match(regex));
}

function shouldHighlightLine(line: Line, highlight: RegExp[], highlightLine: RegExp[], settings: Settings): boolean {
  if (!highlight || highlight.length === 0) {
    return false;
  }
  if (matchFilters(highlight, line.text, settings.filterIntersection) && matchFilters(highlightLine, line.text, settings.filterIntersection)) {
    return true;
  }
  return false;
}

function mergeActiveHighlights(highlightList: Highlight[], caseSensitive: boolean): RegExp[] {
  return highlightList
    .filter((elem) => elem.on)
    .map((elem) => caseSensitive ? new RegExp(elem.text) : new RegExp(elem.text, 'i'));
}

function mergeActiveHighlightLines(highlightList: Highlight[], caseSensitive: boolean): RegExp[] {
  return highlightList
    .filter((elem) => elem.on && elem.line)
    .map((elem) => caseSensitive ? new RegExp(elem.text) : new RegExp(elem.text, 'i'));
}

function getHighlightText(highlightList: Highlight[]): string[] {
  const highlight = [];
  highlightList.forEach((element) => {
    if (element.on && !element.line) {
      highlight.push(element.text);
    }
  });
  return highlight;
}

const getLogLines = (state) => state.log.lines;
const getHighlights = (state) => state.logviewer.highlights;
const getSettings = (state) => state.logviewer.settings;

export default createSelector(
  getLogLines,
  getHighlights,
  getSettings,
  function(lines: Line[], highlightList: Highlight[], settings: Settings) {
    const highlights = mergeActiveHighlights(highlightList, settings.caseSensitive);
    const highlightLine = mergeActiveHighlightLines(highlightList, settings.caseSensitive);
    return lines.filter((line) => {
      if (shouldHighlightLine(line, highlights, highlightLine, settings)) {
        return true;
      }
    });
  }
);
