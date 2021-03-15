// @flow

import queryString from "./thirdparty/query-string";
import type { Filter, Highlight } from "./models";

function parseBookmarks(bookmarks: ?string): Set<number> {
  if (bookmarks == null) {
    return new Set();
  }

  return bookmarks
    .split(",")
    .map((n) => {
      return parseInt(n, 10);
    })
    .filter((n) => Number.isFinite(n))
    .reduce((acc, val) => acc.add(val), new Set());
}

function charToBool(s: string): ?boolean {
  if (s === "0") {
    return false;
  }
  if (s === "1") {
    return true;
  }
  return null;
}

function parseSingleLegacyFilter(
  s: string
): ?[boolean, boolean, boolean, string] {
  if (s == null || s.length < 3) {
    return null;
  }

  const str0 = charToBool(s.charAt(0));
  if (str0 == null) {
    return null;
  }
  const str1 = charToBool(s.charAt(1));
  if (str1 == null) {
    return null;
  }
  const text = s.substring(2);

  return [str0, str1, false, text];
}

function parseSingleFilter(s: string): ?[boolean, boolean, boolean, string] {
  if (s == null || s.length < 4 || s[3] !== "~") {
    return null;
  }

  const str0 = charToBool(s.charAt(0));
  if (str0 == null) {
    return null;
  }
  const str1 = charToBool(s.charAt(1));
  if (str1 == null) {
    return null;
  }
  const str2 = charToBool(s.charAt(2));
  if (str2 == null) {
    return null;
  }
  const text = s.substring(4);
  return [str0, str1, str2, text];
}

function parseFilters(filters: string[], oldFilters: string[]): Filter[] {
  const dedup = new Set();
  const ret = [];
  filters.forEach((f) => {
    const parsed = parseSingleFilter(f);
    if (parsed == null) {
      return;
    }
    const [on, inverse, caseSensitive, text] = parsed;
    if (!dedup.has(text)) {
      dedup.add(text);
      ret.push({
        text,
        on,
        inverse,
        caseSensitive,
      });
    }
  });

  oldFilters.forEach((f) => {
    const parsed = parseSingleLegacyFilter(f);
    if (parsed == null) {
      return;
    }
    const [on, inverse, caseSensitive, text] = parsed;
    if (!dedup.has(text)) {
      dedup.add(text);
      ret.push({
        text,
        on,
        inverse,
        caseSensitive,
      });
    }
  });

  return ret;
}

function parseHighlights(
  highlights: string[],
  oldHighlights: string[]
): Highlight[] {
  const dedup = new Set();
  const ret = [];
  highlights.forEach((h) => {
    const parsed = parseSingleFilter(h);
    if (parsed == null) {
      return;
    }
    const [on, line, caseSensitive, text] = parsed;
    if (!dedup.has(text)) {
      dedup.add(text);
      ret.push({
        text,
        on,
        line,
        caseSensitive,
      });
    }
  });

  oldHighlights.forEach((h) => {
    const parsed = parseSingleLegacyFilter(h);
    if (parsed == null) {
      return;
    }
    const [on, line, caseSensitive, text] = parsed;
    if (!dedup.has(text)) {
      dedup.add(text);
      ret.push({
        text,
        on,
        line,
        caseSensitive,
      });
    }
  });

  return ret;
}

function arrayify(obj: { [string]: mixed }, field: string) {
  if (obj[field] == null) {
    obj[field] = [];
  } else if (typeof obj[field] === "string") {
    obj[field] = [obj[field]];
  }
}

function parseOptionalString(s: ?string): ?string {
  if (s == null) {
    return undefined;
  }
  return s;
}

export type URLParseData = $Exact<
  $ReadOnly<{
    bookmarks: Set<number>,
    filters: Filter[],
    highlights: Highlight[],
    scroll: ?number,
    server: ?string,
    url: ?string,
    caseSensitive: ?boolean,
    filterIsIntersection: ?boolean,
  }>
>;

export default function (
  hashString: ?string = "",
  queryParams: ?string = ""
): URLParseData {
  const hash = queryString.parseUrl(`?${(hashString || "").substring(1)}`);
  const query = queryString.parseUrl(queryParams || "");

  [hash, query].forEach((obj) => {
    arrayify(obj.query, "f");
    arrayify(obj.query, "f~");
    arrayify(obj.query, "h");
    arrayify(obj.query, "h~");
  });

  const bookmarks: Set<number> = new Set([
    ...parseBookmarks(hash.query.bookmarks),
    ...parseBookmarks(query.query.bookmarks),
  ]);

  let scroll = parseInt(hash.query.scroll || query.query.scroll, 10);
  if (!Number.isFinite(scroll) || scroll < 0) {
    scroll = undefined;
  }

  const filters = parseFilters(hash.query["f~"], [
    ...hash.query.f,
    ...query.query.f,
  ]);
  const highlights = parseHighlights(hash.query["h~"], [
    ...hash.query.h,
    ...query.query.h,
  ]);
  const server = parseOptionalString(hash.query.server || query.query.server);
  const url = parseOptionalString(hash.query.url || query.query.url);

  return {
    bookmarks,
    scroll,
    filters,
    highlights,
    server,
    url,
    caseSensitive: charToBool(hash.query.c),
    filterIsIntersection: charToBool(hash.query.l),
  };
}
