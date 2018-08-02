// @flow strict

import type { Bookmark, Highlight, Filter } from '../models';

export const LOGVIEWER_CHANGE_SETTING = 'logviewer:change-setting';
export const LOGVIEWER_CHANGE_FILTER = 'logviewer:change-filter';
export const LOGVIEWER_LOAD_FILTERS = 'logviewer:load-filters';
export const LOGVIEWER_CHANGE_HIGHLIGHT = 'logviewer:change-highlight';
export const LOGVIEWER_LOAD_HIGHLIGHTS = 'logviewer:load-highlights';
export const LOGVIEWER_CHANGE_BOOKMARK = 'logviewer:change-bookmark';
export const LOGVIEWER_LOAD_BOOKMARKS = 'logviewer:load-bookmarks';
export const LOGVIEWER_ENSURE_BOOKMARK = 'logviewer:ensure-bookmark';
export const LOGVIEWER_CHANGE_FINDIDX = 'logviewer:change-findidx';
export const LOGVIEWER_CHANGE_SEARCH = 'logviewer:change-search';

export type ChangeSetting = {|
  +type: 'logviewer:change-setting',
  +payload: {|
    +setting: string,
    +value: string
  |}
|}

export type ChangeFilter = {|
  +type: 'logviewer:change-filter',
  +payload: {|
    +field: string,
    +text: string
  |}
|}

export type ChangeHighlight = {|
  +type: 'logviewer:change-highlight',
  +payload: {|
    +field: string,
    +text: string
  |}
|}

export type ChangeBookmark = {|
  +type: 'logviewer:change-bookmark',
  +payload: {|
    +lineNumArray: number[]
  |}
|}

export type EnsureBookmark = {|
  +type: 'logviewer:ensure-bookmark',
  +payload: {|
    +lineNum: number
  |}
|}

export type LoadBookmarks = {|
  +type: 'logviewer:load-bookmarks',
  +payload: {|
    +bookmarksArr: Bookmark[]
  |}
|}

export type ChangeFindIdx = {|
  +type: 'logviewer:change-findidx',
  +payload: {|
    +index: number
  |}
|}

export type ChangeSearch = {|
  +type: 'logviewer:change-search',
  +payload: {|
    +text: string
  |}
|}

export type LoadHighlights = {|
  +type: 'logviewer:load-highlights',
  +payload: {|
    +initialHighlights: Highlight[]
  |}
|}

export type LoadFilters = {|
  +type: 'logviewer:load-filters',
  +payload: {|
    +initialFilters: Filter[]
  |}
|}

export type Action = ChangeSetting
  | ChangeFilter
  | ChangeHighlight
  | ChangeBookmark
  | EnsureBookmark
  | LoadBookmarks
  | ChangeFindIdx
  | ChangeSearch
  | LoadHighlights
  | LoadFilters

function toggleSetting(setting: string): ChangeSetting {
  return {
    type: LOGVIEWER_CHANGE_SETTING,
    payload: {
      setting: setting,
      value: 'toggle'
    }
  };
}

export function toggleLineWrap(): ChangeSetting {
  return toggleSetting('line-wrap');
}

export function toggleCaseSensitivity(): ChangeSetting {
  return toggleSetting('case-sensitive');
}

export function toggleFilterIntersection(): ChangeSetting {
  return toggleSetting('filter-intersection');
}

export function loadInitialFilters(initialFilters: Filter[]): loadInitialFilters {
  return {
    type: LOGVIEWER_LOAD_FILTERS,
    payload: {
      initialFilters: initialFilters
    }
  };
}

function changeFilter(field: string, text: string): ChangeFilter {
  return {
    type: LOGVIEWER_CHANGE_FILTER,
    payload: {
      field: field,
      text: text
    }
  };
}

export function addFilter(text: string): ChangeFilter {
  return changeFilter('add', text);
}

export function toggleFilterInverse(text: string): ChangeFilter {
  return changeFilter('inverse', text);
}

export function toggleFilter(text: string): ChangeFilter {
  return changeFilter('on', text);
}

export function removeFilter(text: string): ChangeFilter {
  return changeFilter('remove', text);
}

export function loadInitialHighlights(initialHighlights: Highlight[]): loadInitialHighlights {
  return {
    type: LOGVIEWER_LOAD_HIGHLIGHTS,
    payload: {
      initialHighlights: initialHighlights
    }
  };
}

function changeHighlight(field: string, text: string): ChangeHighlight {
  return {
    type: LOGVIEWER_CHANGE_HIGHLIGHT,
    payload: {
      field: field,
      text: text
    }
  };
}

export function addHighlight(text: string): ChangeHighlight {
  return changeHighlight('add', text);
}

export function toggleHighlightLine(text: string): ChangeHighlight {
  return changeHighlight('line', text);
}

export function toggleHighlight(text: string): ChangeHighlight {
  return changeHighlight('on', text);
}

export function removeHighlight(text: string): ChangeHighlight {
  return changeHighlight('remove', text);
}

export function toggleBookmark(lineNumArray: number[]): ChangeBookmark {
  return {
    type: LOGVIEWER_CHANGE_BOOKMARK,
    payload: {
      lineNumArray: lineNumArray
    }
  };
}

export function ensureBookmark(lineNum: number): EnsureBookmark {
  return {
    type: LOGVIEWER_ENSURE_BOOKMARK,
    payload: {
      lineNum: lineNum
    }
  };
}

export function loadBookmarks(bookmarksArr: Bookmark[]): LoadBookmarks {
  return {
    type: LOGVIEWER_LOAD_BOOKMARKS,
    payload: {
      bookmarksArr: bookmarksArr
    }
  };
}

export function changeFindIdx(index: number): ChangeFindIdx {
  return {
    type: LOGVIEWER_CHANGE_FINDIDX,
    payload: {
      index: index
    }
  };
}

export function changeSearch(text: string): ChangeSearch {
  return {
    type: LOGVIEWER_CHANGE_SEARCH,
    payload: {
      text: text
    }
  };
}
