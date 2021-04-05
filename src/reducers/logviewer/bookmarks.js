// @flow strict

import {
  LOGVIEWER_CHANGE_BOOKMARK,
  LOGVIEWER_LOAD_BOOKMARKS,
  LOGVIEWER_ENSURE_BOOKMARK,
  type Action,
} from "../../actions/logviewer";
import type { Bookmark } from "../../models";

const initialState: Bookmark[] = [];

function findBookmark(bookmarkList: Bookmark[], lineNum: number): number {
  return bookmarkList.findIndex(function (bookmark) {
    return bookmark.lineNumber === lineNum;
  });
}

function bookmarkSort(b1: Bookmark, b2: Bookmark): number {
  return b1.lineNumber - b2.lineNumber;
}

function ensureBookmark(lineNum: number, bookmarks: Bookmark[]): Bookmark[] {
  const newBookmarks = bookmarks.slice();
  const i = findBookmark(newBookmarks, lineNum);
  if (i === -1) {
    newBookmarks.push({ lineNumber: lineNum });
    newBookmarks.sort(bookmarkSort);
  }
  return newBookmarks;
}

export default function (
  state: Bookmark[] = initialState,
  action: Action
): Bookmark[] {
  if (action.type === LOGVIEWER_LOAD_BOOKMARKS) {
    const clone = [...action.payload.bookmarksArr];
    clone.sort((a, b) => a.lineNumber - b.lineNumber);
    return clone;
  }

  if (action.type === LOGVIEWER_ENSURE_BOOKMARK) {
    const copyState = state.slice();
    const finalBookmark = ensureBookmark(action.payload.lineNum, copyState);
    return finalBookmark;
  }

  if (action.type !== LOGVIEWER_CHANGE_BOOKMARK) {
    return state;
  }

  let remove = true;
  const newBookmarks = state.slice();
  action.payload.lineNumArray.forEach((element) => {
    const index = findBookmark(newBookmarks, element);
    if (index === -1) {
      newBookmarks.push({ lineNumber: element });
      remove = false;
    }
  });
  if (remove) {
    action.payload.lineNumArray.forEach((element) => {
      const removeIndex = findBookmark(newBookmarks, element);
      newBookmarks.splice(removeIndex, 1);
    });
  }
  newBookmarks.sort(bookmarkSort);

  return newBookmarks;
}
