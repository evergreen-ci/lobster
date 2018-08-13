// @flow strict

import type { ReduxState } from '../models';

export const getLog = (state: ReduxState) => state.log;
export const getLogLines= (state: ReduxState) => getLog(state).lines;
export const getLogIdentity = (state: ReduxState) => getLog(state).identity;

export const getLogViewer = (state: ReduxState) => state.logviewer;

export const getFilters = (state: ReduxState) => getLogViewer(state).filters;
export const getHighlights = (state: ReduxState) => getLogViewer(state).highlights;
export const getBookmarks = (state: ReduxState) => getLogViewer(state).bookmarks;

export const getFind = (state: ReduxState) => getLogViewer(state).find;
export const getFindIdx = (state: ReduxState) => getFind(state).findIdx;
export const getSearchTerm = (state: ReduxState) => getFind(state).searchTerm;

export const getSettings = (state: ReduxState) => getLogViewer(state).settings;

export const getSettingsPanel = (state: ReduxState) => getLogViewer(state).settingsPanel;

export { default as getJiraTemplate } from './jira';
export { default as getLines } from './lines';
