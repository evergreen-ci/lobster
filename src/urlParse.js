// @flow

import queryString from './thirdparty/query-string';
import type { Filter, Highlight } from './models';

function parseBookmarks(bookmarks: ?string): Set<number> {
  if (bookmarks == null) {
    return new Set();
  }

  return bookmarks
    .split(',')
    .map((n) => {
      return parseInt(n, 10);
    })
    .filter((n) => Number.isFinite(n))
    .reduce((acc, val) => acc.add(val), new Set());
}

function parseFilters(filters: string[]): Filter[] {
  const dedup = new Set();
  const ret = [];
  filters.forEach((f) => {
    const text = f.substring(2);
    if (!dedup.has(text)) {
      dedup.add(text);
      const on = (f.charAt(0) === '1');
      const inverse = (f.charAt(1) === '1');
      ret.push({
        text, on, inverse
      });
    }
  });

  return ret;
}

function parseHighlights(filters: string[]): Highlight[] {
  const dedup = new Set();
  const ret = [];
  filters.forEach((f) => {
    const text = f.substring(2);
    if (!dedup.has(text)) {
      dedup.add(text);
      const on = (f.charAt(0) === '1');
      const line = (f.charAt(1) === '1');
      ret.push({
        text, on, line
      });
    }
  });

  return ret;
}

function arrayify(obj: { [string]: mixed }, field: string) {
  if (obj[field] == null) {
    obj[field] = [];
  } else if (typeof obj[field] === 'string') {
    obj[field] = [obj[field]];
  }
}

export default function(hashString: string, queryParams: string) {
  const hash = queryString.parseUrl(`?${hashString.substring(1)}`);
  const query = queryString.parseUrl(queryParams);

  [hash, query].forEach((obj) => {
    arrayify(obj.query, 'f');
    arrayify(obj.query, 'h');
  });

  const bookmarks = new Set([
    ...parseBookmarks(hash.query.bookmarks),
    ...parseBookmarks(query.query.bookmarks)
  ]);
  const scrollToLine = parseInt(hash.query.scroll || query.query.scroll, 10);

  const filters = parseFilters([...hash.query.f, ...query.query.f]);
  const highlights = parseHighlights([...hash.query.h, ...query.query.h]);

  return { bookmarks, scrollToLine, filters, highlights };
}
