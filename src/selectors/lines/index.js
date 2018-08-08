// @flow strict

import { createSelector } from 'reselect';
import type { Line, Highlight, Settings } from '../../models';
import { shouldPrintLine, mergeActiveFilters, mergeActiveInverseFilters } from './search';
import { getHighlightText, shouldHighlightLine, mergeActiveHighlights, mergeActiveHighlightLines } from './highlights';

const getLines = (state) => state.log.lines;
const getFilters = (state) => state.logviewer.filters;
const getHighlights = (state) => state.logviewer.highlights;
const getBookmarks = (state) => state.logviewer.bookmarks;
const getSettings = (state) => state.logviewer.settings;
const getFind = (state) => state.logviewer.find;

export default createSelector(
  getLines,
  getFilters,
  getHighlights,
  getBookmarks,
  getSettings,
  function(lines, filters, highlights, bookmarks, settings) {
    const filter = mergeActiveFilters(filters, settings.caseSensitive);
    const inverseFilter = mergeActiveInverseFilters(filters, settings.caseSensitive);
    const highlight = mergeActiveHighlights(highlights, settings.caseSensitive);
    const highlightLine = mergeActiveHighlightLines(highlights, settings.caseSensitive);
    const highlightText = getHighlightText(highlights);

    const indexMap = new Map();
    const highlightLines = [];
    const outLines = [];

    let j = 0;
    lines.forEach((line, i) => {
      if (!shouldPrintLine(bookmarks, line, filter, inverseFilter)) {
        return;
      }
      outLines.push(line);
      indexMap[i] = j++;
      if (highlight.length > 0
        && shouldHighlightLine(line, highlight, highlightLine)) {
        highlightLines.push(line);
      }
    });

    return {
      indexMap, findResults: outLines, highlightLines, highlightText
    }
  }
);
