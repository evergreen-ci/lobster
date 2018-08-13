import sinon from 'sinon';
import updateURL from './updateURL';
import { testSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';
import * as selectors from '../selectors';

describe('updateURL', () => {
  const mock = sinon.fake();
  beforeEach(function() {
    sinon.replace(window.history, 'replaceState', mock);
    sinon.replaceGetter(window.location, 'pathname', () => '/my/path');
  });

  afterEach(function() {
    sinon.restore();
  })

  test('logkeeper-empty', () => {
    testSaga(updateURL)
      .next()
      .select(selectors.getLogIdentity)
      .next({
        'type': 'logkeeper',
        'build': 'b1234',
        'test': 't1234'
      })
      .select(selectors.getFilters)
      .next([])
      .select(selectors.getHighlights)
      .next([])
      .select(selectors.getBookmarks)
      .next([])
      .isDone();

    expect(mock.callCount).toBe(0);
  });

  test('logkeeper-withdata', () => {
    testSaga(updateURL)
      .next()
      .select(selectors.getLogIdentity)
      .next({
        'type': 'logkeeper',
        'build': 'b1234',
        'test': 't1234'
      })
      .select(selectors.getFilters)
      .next([
        {
          'text': 'filter0',
          'on': true,
          'inverse': false
        },
        {
          'text': 'filter1',
          'on': false,
          'inverse': true
        }
      ])
      .select(selectors.getHighlights)
      .next([
        {
          'text': 'highlight0',
          'on': true,
          'line': false
        },
        {
          'text': 'highlight1',
          'on': false,
          'line': true
        }
      ])
      .select(selectors.getBookmarks)
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
    expect(mock.lastCall.args[2]).toBe('/my/path#bookmarks=0%2C58%2C55%2C120&f=10filter0&f=01filter1&h=10highlight0&h=01highlight1');
  });

  test('lobster-withdata', () => {
    testSaga(updateURL)
      .next()
      .select(selectors.getLogIdentity)
      .next({
        'type': 'lobster',
        'server': 'localhost:9000/api/log',
        'url': 'simple.log'
      })
      .select(selectors.getFilters)
      .next([
        {
          'text': 'filter0',
          'on': true,
          'inverse': false
        },
        {
          'text': 'filter1',
          'on': false,
          'inverse': true
        }
      ])
      .select(selectors.getHighlights)
      .next([
        {
          'text': 'highlight0',
          'on': true,
          'line': false
        },
        {
          'text': 'highlight1',
          'on': false,
          'line': true
        }
      ])
      .select(selectors.getBookmarks)
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
    expect(mock.lastCall.args[2]).toBe('/my/path#bookmarks=0%2C58%2C55%2C120&f=10filter0&f=01filter1&h=10highlight0&h=01highlight1&server=localhost%3A9000%2Fapi%2Flog&url=simple.log');
  });

});
