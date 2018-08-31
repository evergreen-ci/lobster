// @flow strict

import { createSelector } from 'reselect';
import type { ReduxState, Line, FilteredLineData, Filter, Highlight, Bookmark, Settings } from '../../models';
import * as merge from './merge';
import { getHighlightText, shouldHighlightLine } from './highlights';
import * as selectors from '../basic';

export { default as getFilteredLineData } from './filter';
export { default as getFindResults } from './search';
export { default as getHighlights } from './highlights';
