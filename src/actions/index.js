// @flow strict

export const LOGKEEPER_LOAD_DATA = 'logkeeper:load-data';
export const LOBSTER_LOAD_DATA = 'lobster:load-data';
export const LOGKEEPER_LOAD_RESPONSE = 'logkeeper:response';
export const CHANGE_SETTING = 'change-setting';
export const CHANGE_FILTER = 'change-filter';
export const LOAD_FILTERS = 'load-filters';
export const CHANGE_HIGHLIGHT = 'change-highlight';
export const LOAD_HIGHLIGHTS = 'load-highlights';
export const CHANGE_BOOKMARK = 'change-bookmark';
export const LOAD_BOOKMARKS = 'load-bookmarks';
export const ENSURE_BOOKMARK = 'ensure-bookmark';
export const CHANGE_FINDIDX = 'change-findidx';
export const CHANGE_SEARCH = 'change-search';

export type Filter = {
  text: string,
  on: boolean,
  inverse: boolean
}

export type Highlight = {
  text: string,
  on: boolean,
  line: boolean
}

export type Bookmark = {
  lineNumber: number,
}

export type Line = {
  +lineNumber: number,
  +text: string,
  +port: ?string,
  +gitRef: ?string,
}

export type ColorMap = { [string]: string }

export type Log = {
  +lines: Line[],
  +colorMap: ColorMap
}

export type LogkeeperLoadData = {|
  +type: 'logkeeper:load-data',
  +payload: {|
    +build: string,
    +test: ?string
  |}
|}

export type LobsterLoadData = {|
  +type: 'lobster:load-data',
  +payload: {|
    +url: string,
    +server: string
  |}
|}

export type LogkeeperDataResponse = {|
  +type: 'logkeeper:response',
  +payload: {|
    +data: string
  |},
  +error: boolean
|}

export type ChangeSetting = {|
  +type: 'change-setting',
  +payload: {|
    +setting: string,
    +value: string
  |}
|}

export type ChangeFilter = {|
  +type: 'change-filter',
  +payload: {|
    +field: string,
    +text: string
  |}
|}

export type ChangeHighlight = {|
  +type: 'change-highlight',
  +payload: {|
    +field: string,
    +text: string
  |}
|}

export type ChangeBookmark = {|
  +type: 'change-bookmark',
  +payload: {|
    +lineNumArray: number[]
  |}
|}

export type EnsureBookmark = {|
  +type: 'ensure-bookmark',
  +payload: {|
    +lineNum: number
  |}
|}

export type LoadBookmarks = {|
  +type: 'load-bookmarks',
  +payload: {|
    +bookmarksArr: Bookmark[]
  |}
|}

export type ChangeFindIdx = {|
  +type: 'change-findidx',
  +payload: {|
    +index: number
  |}
|}

export type ChangeSearch = {|
  +type: 'change-search',
  +payload: {|
    +text: string
  |}
|}

export type LoadHighlights = {|
  +type: 'load-highlights',
  +payload: {|
    +initialHighlights: Highlight[]
  |}
|}

export type LoadFilters = {|
  +type: 'load-filters',
  +payload: {|
    +initialFilters: Filter[]
  |}
|}

export type Action = LogkeeperLoadData
  | LogkeeperDataResponse
  | LobsterLoadData
  | ChangeSetting
  | ChangeFilter
  | ChangeHighlight
  | ChangeBookmark
  | EnsureBookmark
  | LoadBookmarks
  | ChangeFindIdx
  | ChangeSearch
  | LoadHighlights
  | LoadFilters

// Load data from Logkeeper
export function loadData(build: string, test: ?string): LogkeeperLoadData {
  return {
    type: LOGKEEPER_LOAD_DATA,
    payload: {
      build: build,
      test: test
    }
  };
}

// Load data from the lobster server
export function lobsterLoadData(server: string, url: string): LobsterLoadData {
  return {
    type: LOBSTER_LOAD_DATA,
    payload: {
      url: url,
      server: server
    }
  };
}

export function logkeeperDataSuccess(data: string): LogkeeperDataResponse {
  return {
    type: LOGKEEPER_LOAD_RESPONSE,
    payload: {
      data: data
    },
    error: false
  };
}

export function logkeeperDataError(data: string): LogkeeperDataResponse {
  return {
    type: LOGKEEPER_LOAD_RESPONSE,
    payload: {
      data: data
    },
    error: true
  };
}

function toggleSetting(setting: string): ChangeSetting {
  return {
    type: CHANGE_SETTING,
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
    type: LOAD_FILTERS,
    payload: {
      initialFilters: initialFilters
    }
  };
}

function changeFilter(field: string, text: string): ChangeFilter {
  return {
    type: CHANGE_FILTER,
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
    type: LOAD_HIGHLIGHTS,
    payload: {
      initialHighlights: initialHighlights
    }
  };
}

function changeHighlight(field: string, text: string): ChangeHighlight {
  return {
    type: CHANGE_HIGHLIGHT,
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
    type: CHANGE_BOOKMARK,
    payload: {
      lineNumArray: lineNumArray
    }
  };
}

export function ensureBookmark(lineNum: number): EnsureBookmark {
  return {
    type: ENSURE_BOOKMARK,
    payload: {
      lineNum: lineNum
    }
  };
}

export function loadBookmarks(bookmarksArr: Bookmark[]): LoadBookmarks {
  return {
    type: LOAD_BOOKMARKS,
    payload: {
      bookmarksArr: bookmarksArr
    }
  };
}

export function changeFindIdx(index: number): ChangeFindIdx {
  return {
    type: CHANGE_FINDIDX,
    payload: {
      index: index
    }
  };
}

export function changeSearch(text: string): ChangeSearch {
  return {
    type: CHANGE_SEARCH,
    payload: {
      text: text
    }
  };
}
