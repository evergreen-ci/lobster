// @flow strict

// This file is for selectors to access reducer state
import type { ReduxState } from '../models';

export const getLog = (state: ReduxState) => state.log;
export const getLogLines = (state: ReduxState) => getLog(state).lines;
export const getLogIdentity = (state: ReduxState) => getLog(state).identity;
export const getLogColorMap = (state: ReduxState) => getLog(state).colorMap;

export const getLogViewer = (state: ReduxState) => state.logviewer;

export const getLogViewerFilters = (state: ReduxState) => getLogViewer(state).filters;
export const getLogViewerHighlights = (state: ReduxState) => getLogViewer(state).highlights;
export const getLogViewerBookmarks = (state: ReduxState) => getLogViewer(state).bookmarks;

export const getLogViewerFind = (state: ReduxState) => getLogViewer(state).find;
export const getLogViewerFindIdx = (state: ReduxState) => getLogViewerFind(state).findIdx;
export const getLogViewerSearchTerm = (state: ReduxState) => getLogViewerFind(state).searchTerm;
export const getLogViewerSearchTermError = (state: ReduxState) => getLogViewerFind(state).regexError;
export const getLogViewerSearchStartRange = (state: ReduxState) => getLogViewerFind(state).startRange;
export const getLogViewerSearchEndRange = (state: ReduxState) => getLogViewerFind(state).endRange;

export const getLogViewerSettings = (state: ReduxState) => getLogViewer(state).settings;
export const getLogViewerSettingsWrap = (state: ReduxState) => getLogViewerSettings(state).wrap;
export const getLogViewerSettingsFilterLogic = (state: ReduxState) => getLogViewerSettings(state).filterIntersection;
export const getLogViewerSettingsCaseSensitive = (state: ReduxState) => getLogViewerSettings(state).caseSensitive;
export const getLogViewerSettingsParseJson = (state: ReduxState) => getLogViewerSettings(state).parseResmokeJson;

export const getIsLogViewerSettingsPanel = (state: ReduxState) => getLogViewer(state).settingsPanel;
export const getLogViewerScrollLine = (state: ReduxState) => getLogViewer(state).scrollLine;

export const getCache = (state: ReduxState) => state.cache;
