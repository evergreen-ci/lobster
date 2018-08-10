// @flow strict

import { createSelector } from 'reselect';
import type { Line, Bookmark } from '../models';

const getLogLines = (state) => state.log.lines;
const getBookmarks = (state) => state.logviewer.bookmarks;

export default createSelector(
  getLogLines,
  getBookmarks,
  function(lines: Line[], bookmarks: Bookmark[]) {
    if (bookmarks.length === 0 || lines.length === 0) {
      return '';
    }

    let text = '{noformat}\n';
    for (let i = 0; i < bookmarks.length; i++) {
      const curr = bookmarks[i].lineNumber;
      if (curr >= lines.length) {
        text += '{noformat}';
        return text;
      }

      text += lines[curr].text + '\n';
      if ((i !== (bookmarks.length - 1)) && (bookmarks[i + 1].lineNumber !== (curr + 1))) {
        text += '...\n';
      }
    }
    text += '{noformat}';
    return text;
  }
);
