// @flow strict

import { defaultMemoize } from "reselect";
import type { Filter, Highlight } from "../../models";

export const activeFilters: (Filter[]) => RegExp[] = defaultMemoize(function (
  filterList: Filter[]
): RegExp[] {
  return filterList
    .filter((elem) => elem.on && !elem.inverse)
    .map((elem) =>
      elem.caseSensitive ? new RegExp(elem.text) : new RegExp(elem.text, "i")
    );
});

export const activeInverseFilters: (Filter[]) => RegExp[] = defaultMemoize(
  function (filterList: Filter[]): RegExp[] {
    return filterList
      .filter((elem) => elem.on && elem.inverse)
      .map((elem) =>
        elem.caseSensitive ? new RegExp(elem.text) : new RegExp(elem.text, "i")
      );
  }
);

export const activeHighlights: (Highlight[]) => RegExp[] = defaultMemoize(
  function (highlightList: Highlight[]): RegExp[] {
    return highlightList
      .filter((elem) => elem.on)
      .map((elem) =>
        elem.caseSensitive ? new RegExp(elem.text) : new RegExp(elem.text, "i")
      );
  }
);

export const activeHighlightLines: (Highlight[]) => RegExp[] = defaultMemoize(
  function (highlightList: Highlight[]): RegExp[] {
    return highlightList
      .filter((elem) => elem.on && elem.line)
      .map((elem) =>
        elem.caseSensitive ? new RegExp(elem.text) : new RegExp(elem.text, "i")
      );
  }
);
