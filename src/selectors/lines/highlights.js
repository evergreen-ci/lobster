// @flow strict

import { defaultMemoize, createSelector } from "reselect";
import * as merge from "./merge";
import * as selectors from "../basic";
import getFilteredLineData from "./filter";
import type { Line, Highlight, HighlightLineData } from "../../models";

function matchFilters(
  filter: RegExp[],
  string: string,
  isIntersection: boolean
): boolean {
  if (isIntersection) {
    return filter.every((regex) => string.match(regex));
  }
  return filter.some((regex) => string.match(regex));
}

export const shouldHighlightLine = function (
  line: Line,
  highlight: RegExp[],
  highlightLine: RegExp[],
  filterIntersection: boolean
): boolean {
  if (!highlight || highlight.length === 0) {
    return false;
  }
  if (
    matchFilters(highlight, line.text, filterIntersection) &&
    matchFilters(highlightLine, line.text, filterIntersection)
  ) {
    return true;
  }
  return false;
};

export const getHighlightText = defaultMemoize(function (
  highlights: Highlight[]
): string[] {
  return highlights
    .filter((element) => element.on && !element.line)
    .map((e) => e.text);
});

const getHighlights = createSelector(
  getFilteredLineData,
  selectors.getLogViewerHighlights,
  selectors.getLogViewerSettingsFilterLogic,
  function (
    lines: Line[],
    highlights: Highlight[],
    filterIntersection: boolean
  ): HighlightLineData {
    console.log("highlights-selector");
    const highlight = merge.activeHighlights(highlights);
    const highlightLine = merge.activeHighlightLines(highlights);
    const highlightText = getHighlightText(highlights);

    const highlightLines = lines.filter((line) => {
      return shouldHighlightLine(
        line,
        highlight,
        highlightLine,
        filterIntersection
      );
    });

    return {
      highlightLines: highlightLines,
      highlightText: highlightText,
    };
  }
);

export default createSelector(
  selectors.getLogViewerSearchTerm,
  getHighlights,
  function (
    searchTerm: string,
    highlights: HighlightLineData
  ): HighlightLineData {
    if (!searchTerm) {
      return highlights;
    }
    try {
      RegExp(searchTerm);
      return {
        ...highlights,
        highlightText: highlights.highlightText.concat([searchTerm]),
      };
    } catch (_e) {
      return highlights;
    }
  }
);
