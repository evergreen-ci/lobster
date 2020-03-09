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
export const LOGVIEWER_CHANGE_START_RANGE = 'logviewer:change-start-range';
export const LOGVIEWER_CHANGE_END_RANGE = 'logviewer:change-end-range';
export const LOGVIEWER_TOGGLE_SETTINGS_PANEL = 'logviewer:toggle-settings-panel';
export const LOGVIEWER_SEARCH_EVENT = 'logviewer:search-event';
export const LOGVIEWER_SCROLL_TO_LINE = 'logviewer:scroll-to-line';

export type ChangeSetting = {|
  type: 'logviewer:change-setting',
  +payload: {|
    +setting: string,
    +value: string
  |}
|}

export type ChangeFilter = {|
  type: 'logviewer:change-filter',
  +payload: {|
    +field: string,
    +text: string,
    +caseSensitive?: boolean
  |}
|}

export type ChangeHighlight = {|
  type: 'logviewer:change-highlight',
  +payload: {|
    +field: string,
    +text: string,
    +caseSensitive?: boolean
  |}
|}

export type ChangeBookmark = {|
  type: 'logviewer:change-bookmark',
  +payload: {|
    +lineNumArray: number[]
  |}
|}

export type EnsureBookmark = {|
  type: 'logviewer:ensure-bookmark',
  +payload: {|
    +lineNum: number
  |}
|}

export type LoadBookmarks = {|
  type: 'logviewer:load-bookmarks',
  +payload: {|
    +bookmarksArr: Bookmark[]
  |}
|}

export type ChangeFindIdx = {|
  type: 'logviewer:change-findidx',
  +payload: {|
    +index: number
  |}
|}

export type ChangeSearch = {|
  type: 'logviewer:change-search',
  +payload: {|
    +text: string
  |}
|}

export type ChangeStartRange = {|
  type: 'logviewer:change-start-range',
  +payload: {|
    +start: number
  |}
|}

export type ChangeEndRange = {|
  type: 'logviewer:change-end-range',
  +payload: {|
    +end: number
  |}
|}

export type LoadHighlights = {|
  type: 'logviewer:load-highlights',
  +payload: {|
    +initialHighlights: Highlight[]
  |}
|}

export type LoadFilters = {|
  type: 'logviewer:load-filters',
  +payload: {|
    +initialFilters: Filter[]
  |}
|}

export type ToggleSettingsPanel = $Exact<{
  type: 'logviewer:toggle-settings-panel',
  +payload: {}
}>

export type SearchEventDirection = $Exact<$ReadOnly<{
  action: 'next' | 'prev'
}>>

export type SearchEventSetTerm = $Exact<$ReadOnly<{
  action: 'search',
  term: string
}>>

export type SearchEvent= $Exact<{
  type: 'logviewer:search-event',
  +payload: SearchEventDirection | SearchEventSetTerm
}>

export type ScrollToLine= $Exact<{
  type: 'logviewer:scroll-to-line',
  +payload: $Exact<$ReadOnly<{
    line: number
  }>>
}>

export type Action = ChangeSetting
  | ChangeFilter
  | ChangeHighlight
  | ChangeBookmark
  | EnsureBookmark
  | LoadBookmarks
  | ChangeFindIdx
  | ChangeSearch
  | ChangeStartRange
  | ChangeEndRange
  | LoadHighlights
  | LoadFilters
  | ToggleSettingsPanel
  | ScrollToLine

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

export function toggleExpandableRows(): ChangeSetting {
  return toggleSetting('expandable-rows');
}

export function toggleParseResmokeJson(): ChangeSetting {
  return toggleSetting('parse-resmoke-json');
}

export function togglePrettyPrint(): ChangeSetting {
  return toggleSetting('pretty-print');
}

export function loadInitialFilters(initialFilters: Filter[]): LoadFilters {
  return {
    type: LOGVIEWER_LOAD_FILTERS,
    payload: {
      initialFilters: initialFilters
    }
  };
}

function changeFilter(field: string, text: string, caseSensitive?: boolean): ChangeFilter {
  return {
    type: LOGVIEWER_CHANGE_FILTER,
    payload: {
      field: field,
      text: text,
      caseSensitive: caseSensitive
    }
  };
}

export function addFilter(text: string, caseSensitive: boolean): ChangeFilter {
  return changeFilter('add', text, caseSensitive);
}

export function toggleFilterInverse(text: string): ChangeFilter {
  return changeFilter('inverse', text);
}

export function toggleFilter(text: string): ChangeFilter {
  return changeFilter('on', text);
}

export function toggleFilterCaseSensitive(text: string): ChangeFilter {
  return changeFilter('caseSensitive', text);
}

export function removeFilter(text: string): ChangeFilter {
  return changeFilter('remove', text);
}

export function loadInitialHighlights(initialHighlights: Highlight[]): LoadHighlights {
  return {
    type: LOGVIEWER_LOAD_HIGHLIGHTS,
    payload: {
      initialHighlights: initialHighlights
    }
  };
}

function changeHighlight(field: string, text: string, caseSensitive?: boolean): ChangeHighlight {
  return {
    type: LOGVIEWER_CHANGE_HIGHLIGHT,
    payload: {
      field: field,
      text: text,
      caseSensitive: caseSensitive
    }
  };
}

export function addHighlight(text: string, caseSensitive: boolean): ChangeHighlight {
  return changeHighlight('add', text, caseSensitive);
}

export function toggleHighlightLine(text: string): ChangeHighlight {
  return changeHighlight('line', text);
}

export function toggleHighlight(text: string): ChangeHighlight {
  return changeHighlight('on', text);
}

export function toggleHighlightCaseSensitive(text: string): ChangeHighlight {
  return changeHighlight('caseSensitive', text);
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

export function changeStartRange(start: number): ChangeStartRange {
  return {
    type: LOGVIEWER_CHANGE_START_RANGE,
    payload: {
      start: start
    }
  }
}

export function changeEndRange(end: number): ChangeEndRange {
  return {
    type: LOGVIEWER_CHANGE_END_RANGE,
    payload: {
      end: end
    }
  }
}

export function toggleSettingsPanel(): ToggleSettingsPanel {
  return {
    type: LOGVIEWER_TOGGLE_SETTINGS_PANEL,
    payload: {}
  };
}

export function search(action: 'next' | 'prev'): SearchEvent {
  return {
    type: LOGVIEWER_SEARCH_EVENT,
    payload: {
      action: action
    }
  };
}

export function scrollToLine(n: number): ScrollToLine {
  return {
    type: LOGVIEWER_SCROLL_TO_LINE,
    payload: {
      line: n
    }
  };
}
