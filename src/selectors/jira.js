// @flow strict

import { createSelector } from "reselect";
import type { ReduxState, Line, Bookmark } from "../models";

const getLogLines = (state) => state.log.lines;
const getBookmarks = (state) => state.logviewer.bookmarks;

const getJiraTemplate = createSelector(
  getLogLines,
  getBookmarks,
  function (lines: Line[], bookmarks: Bookmark[]) {
    if (bookmarks.length === 0 || lines.length === 0) {
      return "";
    }

    let text = "{noformat}\n";
    for (let i = 0; i < bookmarks.length; i++) {
      const curr = bookmarks[i].lineNumber;
      if (curr >= lines.length) {
        text += "{noformat}";
        return text;
      }

      text += lines[curr].text + "\n";
      if (
        i !== bookmarks.length - 1 &&
        bookmarks[i + 1].lineNumber !== curr + 1
      ) {
        text += "...\n";
      }
    }
    text += "{noformat}";
    return text;
  }
);

// because this function memoises based on its parameters, prevent the user
// from passing the components props into it. Ideally, all users are relying on
// only the redux store's state to derive this data
export default function (state: ReduxState) {
  return getJiraTemplate(state);
}
