// @flow

import type { Line } from "src/models";
import { shouldPrintLine } from "./filter";
import { activeFilters, activeInverseFilters } from "./merge";

type LineTest = {
  obj: Line,
  _expected: boolean,
};

function f(text) {
  return new RegExp(text, "i");
}
function makeLine(text: string, expected: boolean): LineTest {
  return {
    obj: {
      lineNumber: 0,
      text: text,
      port: null,
      gitRef: null,
    },
    _expected: expected,
  };
}

const MODE_AND = true;
const MODE_OR = false;

test("selectors-inclusionary-and", function () {
  const mode = MODE_AND;
  const filters = [f("A"), f("B")];
  const invFilters = [];
  [
    makeLine("AA", false),
    makeLine("AB", true), // A AND B
    makeLine("C", false),
  ].forEach(function (d) {
    expect(shouldPrintLine(d.obj, [], mode, filters, invFilters)).toBe(
      d._expected
    );
  });
});

test("selectors-inclusionary-or", function () {
  const mode = MODE_OR;
  const filters = [f("A"), f("B")];
  const invFilters = [];
  [
    makeLine("AA", true), // A OR B
    makeLine("AB", true), // A OR B
    makeLine("C", false),
  ].forEach(function (d) {
    expect(shouldPrintLine(d.obj, [], mode, filters, invFilters)).toBe(
      d._expected
    );
  });
});

test("selectors-exclusionary-and", function () {
  const mode = MODE_AND;
  const filters = [];
  const invFilters = [f("A"), f("B")];
  [
    makeLine("AA", false),
    makeLine("AB", false),
    makeLine("C", true), // !A AND !B
  ].forEach(function (d) {
    expect(shouldPrintLine(d.obj, [], mode, filters, invFilters)).toBe(
      d._expected
    );
  });
});

test("selectors-exclusionary-or", function () {
  const mode = MODE_OR;
  const filters = [];
  const invFilters = [f("A"), f("B")];
  [
    makeLine("AA", true), // !A OR !B
    makeLine("AB", false),
    makeLine("C", true), // !A OR !B
  ].forEach(function (d) {
    expect(shouldPrintLine(d.obj, [], mode, filters, invFilters)).toBe(
      d._expected
    );
  });
});

test("selectors-mixed-and", function () {
  const mode = MODE_AND;
  const filters = [f("A")];
  const invFilters = [f("B")];
  [
    makeLine("AA", true), // A AND !B
    makeLine("AB", false),
    makeLine("C", false),
  ].forEach(function (d) {
    expect(shouldPrintLine(d.obj, [], mode, filters, invFilters)).toBe(
      d._expected
    );
  });
});

test("selectors-mixed-or", function () {
  const mode = MODE_OR;
  const filters = [f("A")];
  const invFilters = [f("B")];
  [
    makeLine("AA", true), // A OR !B
    makeLine("AB", true), // A OR !B
    makeLine("B", false),
    makeLine("C", true), // A or !B
  ].forEach(function (d) {
    expect(shouldPrintLine(d.obj, [], mode, filters, invFilters)).toBe(
      d._expected
    );
  });
});

test("selectors-shouldPrintLine", function () {
  const lines = [
    { lineNumber: 0, text: "line 0", gitRef: null, port: null },
    { lineNumber: 1, text: "line 1", gitRef: null, port: null },
    { lineNumber: 2, text: "line 2", gitRef: null, port: null },
    { lineNumber: 3, text: "line 3", gitRef: null, port: null },
    { lineNumber: 4, text: "line 4", gitRef: null, port: null },
    { lineNumber: 5, text: "line 5", gitRef: null, port: null },
  ];

  const filters = [
    { on: true, text: "Line ", inverse: false, caseSensitive: false },
    { on: true, text: "Line 4", inverse: false, caseSensitive: false },
  ];
  const bookmarks = [{ lineNumber: 0 }, { lineNumber: 5 }];
  let filtersRegexps = activeFilters(filters);
  let inverseFilters = activeInverseFilters(filters);

  lines.forEach((line) =>
    expect(
      shouldPrintLine(line, bookmarks, false, filtersRegexps, inverseFilters)
    ).toBe(true)
  );

  filters[0].caseSensitive = true;
  filters[1].caseSensitive = true;
  filtersRegexps = activeFilters(filters.slice());
  inverseFilters = activeInverseFilters(filters.slice());
  [lines[0], lines[5]].forEach((line) =>
    expect(
      shouldPrintLine(line, bookmarks, false, filtersRegexps, inverseFilters)
    ).toBe(true)
  );
  [lines[1], lines[2], lines[3], lines[4]].forEach((line) =>
    expect(
      shouldPrintLine(line, bookmarks, false, filtersRegexps, inverseFilters)
    ).toBe(false)
  );

  [lines[0], lines[5]].forEach((line) =>
    expect(
      shouldPrintLine(line, bookmarks, true, filtersRegexps, inverseFilters)
    ).toBe(true)
  );
  [lines[1], lines[2], lines[3], lines[4]].forEach((line) =>
    expect(
      shouldPrintLine(line, bookmarks, true, filtersRegexps, inverseFilters)
    ).toBe(false)
  );

  filters[0].on = false;
  filters[0].inverse = true;
  filters[0].caseSensitive = false;
  filters[1].caseSensitive = false;
  filtersRegexps = activeFilters(filters.slice());
  inverseFilters = activeInverseFilters(filters.slice());
  [lines[0], lines[4], lines[5]].forEach((line) =>
    expect(
      shouldPrintLine(line, bookmarks, true, filtersRegexps, inverseFilters)
    ).toBe(true)
  );
  [lines[1], lines[2], lines[3]].forEach((line) =>
    expect(
      shouldPrintLine(line, bookmarks, true, filtersRegexps, inverseFilters)
    ).toBe(false)
  );
});
