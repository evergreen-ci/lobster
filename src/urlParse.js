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

function charToBool(s: string): ?boolean {
  if (s === '0') {
    return false;
  }
  if (s === '1') {
    return true;
  }
  return null;
}

function parseSingleFilter(s: string): ?[boolean, boolean, string] {
  if (s == null || s.length < 3) {
    return null;
  }

  const str0 = charToBool(s.charAt(0));
  if(str0 == null) {
    return null;
  }
  const str1 = charToBool(s.charAt(1));
  if(str1 == null) {
    return null;
  }
  const text = s.substring(2);

  return [str0, str1, text];
}

function parseFilters(filters: string[]): Filter[] {
  const dedup = new Set();
  const ret = [];
  filters.forEach((f) => {
    const parsed = parseSingleFilter(f);
    if (parsed == null) {
      return;
    }
    const [on, inverse, text] = parsed;
    if (!dedup.has(text)) {
      dedup.add(text);
      ret.push({
        text, on, inverse
      });
    }
  });

  return ret;
}

function parseHighlights(highlights: string[]): Highlight[] {
  const dedup = new Set();
  const ret = [];
  highlights.forEach((h) => {
    const parsed = parseSingleFilter(h);
    if (parsed == null) {
      return;
    }
    const [on, line, text] = parsed;
    if (!dedup.has(text)) {
      dedup.add(text);
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

export default function(hashString: string = '', queryParams: string = '') {
  const hash = queryString.parseUrl(`?${(hashString || '').substring(1)}`);
  const query = queryString.parseUrl(queryParams || '');

  [hash, query].forEach((obj) => {
    arrayify(obj.query, 'f');
    arrayify(obj.query, 'h');
  });

  const bookmarks: Set<number> = new Set([
    ...parseBookmarks(hash.query.bookmarks),
    ...parseBookmarks(query.query.bookmarks)
  ]);

  let scrollToLine = parseInt(hash.query.scroll || query.query.scroll, 10);
  if (!Number.isFinite(scrollToLine)) {
    scrollToLine = undefined;
  }

  const filters = parseFilters([...hash.query.f, ...query.query.f]);
  const highlights = parseHighlights([...hash.query.h, ...query.query.h]);

  return { bookmarks, scrollToLine, filters, highlights };
}
