// @flow strict

import type { ReduxState } from '../models';

export const getLog = (state: ReduxState) => state.log;
export const getLogLines = (state: ReduxState) => getLog(state).lines;
export const getLogIdentity = (state: ReduxState) => getLog(state).identity;

export const getLogViewer = (state: ReduxState) => state.logviewer;

export const getLogViewerFilters = (state: ReduxState) => getLogViewer(state).filters;
export const getLogViewerHighlights = (state: ReduxState) => getLogViewer(state).highlights;
export const getLogViewerBookmarks = (state: ReduxState) => getLogViewer(state).bookmarks;

export const getLogViewerFind = (state: ReduxState) => getLogViewer(state).find;
export const getLogViewerFindIdx = (state: ReduxState) => getLogViewerFind(state).findIdx;
export const getLogViewerSearchTerm = (state: ReduxState) => getLogViewerFind(state).searchTerm;

export const getLogViewerSettings = (state: ReduxState) => getLogViewer(state).settings;

export const getIsLogViewerSettingsPanel = (state: ReduxState) => getLogViewer(state).settingsPanel;

