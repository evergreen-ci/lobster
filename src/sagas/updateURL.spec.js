import sinon from 'sinon';
import updateURL from './updateURL';
import { testSaga } from 'redux-saga-test-plan';
import * as selectors from '../selectors';

describe('updateURL', () => {
  let mock = sinon.fake();
  beforeEach(function() {
    sinon.replace(window.history, 'replaceState', mock);
    sinon.replaceGetter(window.location, 'pathname', () => '/my/path');
  });

  afterEach(function() {
    sinon.restore();
    mock = sinon.fake();
  });

  test('logkeeper-empty', function() {
    testSaga(updateURL)
      .next()
      .select(selectors.getLogIdentity)
      .next({
        'type': 'logkeeper',
        'build': 'b1234',
        'test': 't1234'
      })
      .select(selectors.getLogViewerFilters)
      .next([])
      .select(selectors.getLogViewerHighlights)
      .next([])
      .select(selectors.getLogViewerBookmarks)
      .next([])
      .isDone();

    expect(mock.callCount).toBe(0);
  });

  test('logkeeper-withdata', function() {
    testSaga(updateURL)
      .next()
      .select(selectors.getLogIdentity)
      .next({
        'type': 'logkeeper',
        'build': 'b1234',
        'test': 't1234'
      })
      .select(selectors.getLogViewerFilters)
      .next([
        {
          'text': 'filter0',
          'on': true,
          'inverse': false,
          'caseSensitive': false
        },
        {
          'text': 'filter1',
          'on': false,
          'inverse': true,
          'caseSensitive': true
        }
      ])
      .select(selectors.getLogViewerHighlights)
      .next([
        {
          'text': 'highlight0',
          'on': true,
          'line': false,
          'caseSensitive': false
        },
        {
          'text': 'highlight1',
          'on': false,
          'line': true,
          'caseSensitive': true
        }
      ])
      .select(selectors.getLogViewerBookmarks)
      .next([
        {
          lineNumber: 0
        },
        {
          lineNumber: 58
        },
        {
          lineNumber: 55
        },
        {
          lineNumber: 120
        }
      ])
      .isDone();

    expect(mock.callCount).toBe(1);
    expect(mock.lastCall.args[0]).toEqual({});
    expect(mock.lastCall.args[1]).toBe('');
    expect(mock.lastCall.args[2]).toBe('/my/path#bookmarks=0%2C58%2C55%2C120&f=100~filter0&f=011~filter1&h=100~highlight0&h=011~highlight1');
  });

  test('lobster-withdata', function() {
    testSaga(updateURL)
      .next()
      .select(selectors.getLogIdentity)
      .next({
        'type': 'lobster',
        'server': 'localhost:9000/api/log',
        'url': 'simple.log'
      })
      .select(selectors.getLogViewerFilters)
      .next([
        {
          'text': 'filter0',
          'on': true,
          'inverse': false,
          'caseSensitive': false
        },
        {
          'text': 'filter1',
          'on': false,
          'inverse': true,
          'caseSensitive': true
        }
      ])
      .select(selectors.getLogViewerHighlights)
      .next([
        {
          'text': 'highlight0',
          'on': true,
          'line': false,
          'caseSensitive': false
        },
        {
          'text': 'highlight1',
          'on': false,
          'line': true,
          'caseSensitive': true
        }
      ])
      .select(selectors.getLogViewerBookmarks)
      .next([
        {
          lineNumber: 0
        },
        {
          lineNumber: 58
        },
        {
          lineNumber: 55
        },
        {
          lineNumber: 120
        }
      ])
      .isDone();

    expect(mock.callCount).toBe(1);
    expect(mock.lastCall.args[0]).toEqual({});
    expect(mock.lastCall.args[1]).toBe('');
    expect(mock.lastCall.args[2]).toBe('/my/path#bookmarks=0%2C58%2C55%2C120&f=100~filter0&f=011~filter1&h=100~highlight0&h=011~highlight1&server=localhost%3A9000%2Fapi%2Flog&url=simple.log');
  });
});
