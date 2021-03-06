import { testSaga } from "redux-saga-test-plan";
import urlParse from "./urlParse";
import * as actions from "../actions";
import { getLogViewerSettings } from "../selectors";

describe("urlParse", function () {
  test("urlParse", () => {
    window.location.href =
      "http://domain.invalid/?scroll=99&bookmarks=0,1,2&url=urlserver&server=serverserver&f=11doop&c=0";
    window.location.hash =
      "#scroll=0&bookmarks=2,4,5&url=urlhash&server=serverhash&f=00boop&c=1&l=1";

    testSaga(urlParse)
      .next()
      .put(actions.loadBookmarks([2, 4, 5].map((n) => ({ lineNumber: n }))))
      .next()
      .put(
        actions.loadInitialFilters([
          {
            on: false,
            inverse: false,
            text: "boop",
            caseSensitive: false,
          },
        ])
      )
      .next()
      .put(actions.loadInitialHighlights([]))
      .next()
      .put(actions.scrollToLine(0))
      .next()
      .put(actions.ensureBookmark(0))
      .next()
      .select(getLogViewerSettings)
      .next()
      .put(actions.toggleCaseSensitivity())
      .next()
      .put(actions.toggleFilterIntersection())
      .next()
      .isDone();
  });
});
