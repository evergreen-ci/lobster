// @flow strict

import { CHANGE_BOOKMARK, LOAD_BOOKMARKS } from '../actions';
import type { Action } from '../actions';

export type Bookmark = {|
  +lineNumber: number,
  +scrollFunc: func
|}

const initialState: Bookmarks[] = [];

function findBookmark(bookmarkList, lineNum) {
  return bookmarkList.findIndex(function(bookmark) {
    return bookmark.lineNumber === lineNum;
  });
}

export default function(state: Bookmarks = initialState, action: Action): Settings {
  if (action.type === LOAD_BOOKMARKS) {
    return action.payload.bookmarksArr;
  }

  if (action.type !== CHANGE_BOOKMARK) {
    return state;
  }

  let remove = true;
  const newBookmarks = state.slice();
  action.payload.lineNumArray.forEach((element) => {
    const index = findBookmark(newBookmarks, element);
    if (index === -1) {
      newBookmarks.push({lineNumber: element});
      remove = false;
    }
  });
  if (remove) {
    action.payload.lineNumArray.forEach((element) => {
      const removeIndex = findBookmark(newBookmarks, element);
      newBookmarks.splice(removeIndex, 1);
    });
  }
  newBookmarks.sort((b1, b2) => b1.lineNumber - b2.lineNumber);

  return newBookmarks;
}
