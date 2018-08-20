import { testSaga } from 'redux-saga-test-plan';
import search from './search';
import { getFilteredLineData, getLogViewerFindIdx } from '../selectors';
import * as actions from '../actions';

const emptyData = (action) => {
  return testSaga(search, action)
    .next()
    .select(getFilteredLineData)
    .next({
      indexMap: new Map(),
      findResults: [],
      filteredLines: [],
      highlightLines: [],
      highlightText: []
    });
};

const runLinesSelector = () => {
  const state = {
    log: {
      lines: [
        {
          lineNumber: 0,
          text: 'test noresults 0',
          port: null,
          gitRef: null
        },
        {
          lineNumber: 1,
          text: 'test noresults 1',
          port: null,
          gitRef: null
        },
        {
          lineNumber: 2,
          text: 'test noresults 2',
          port: null,
          gitRef: null
        },
        {
          lineNumber: 3,
          text: 'test noresults 3',
          port: null,
          gitRef: null
        },
        {
          lineNumber: 4,
          text: 'something else',
          port: null,
          gitRef: null
        }
      ]
    },
    logviewer: {
      filters: [{
        on: true,
        inverse: false,
        text: 'noresults'
      }],
      highlights: [],
      bookmarks: [],
      settings: {
        caseSensitive: false,
        wrap: false,
        filterIntersection: false
      },
      find: {
        searchTerm: 'noresults'
      }
    }
  };

  return getFilteredLineData(state);
};

const withSearchTerm = (action, index = -1) => {
  return testSaga(search, action)
    .next()
    .select(getFilteredLineData)
    .next(runLinesSelector())
    .select(getLogViewerFindIdx)
    .next(index);
};

describe('search-change', function() {
  test('noresults', () => {
    emptyData(actions.changeSearch('noresults 0'))
      .isDone();

    withSearchTerm(actions.changeSearch('noresults'))
      .put(actions.changeFindIdx(0))
      .next()
      .isDone();
  });

  test('empty-search', () => {
    withSearchTerm(actions.changeSearch(''))
      .put(actions.changeFindIdx(-1))
      .next()
      .isDone();
  });
});

describe('search-event', function() {
  test('next', () => {
    emptyData(actions.search('next'))
      .isDone();

    withSearchTerm(actions.search('next'), 0)
      .put(actions.changeFindIdx(1))
      .next()
      .isDone();

    withSearchTerm(actions.search('next'), 3)
      .put(actions.changeFindIdx(0))
      .next()
      .isDone();
  });

  test('prev', () => {
    emptyData(actions.search('prev'))
      .isDone();

    withSearchTerm(actions.search('prev'), 0)
      .put(actions.changeFindIdx(3))
      .next()
      .isDone();

    withSearchTerm(actions.search('prev'), 3)
      .put(actions.changeFindIdx(2))
      .next()
      .isDone();
  });
});
