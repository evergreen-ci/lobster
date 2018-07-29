// @flow

import sinon from 'sinon';
import * as lobstercage from './lobstercage';
import { expectSaga } from 'redux-saga-test-plan';

/* eslint-disable flowtype/no-flow-fix-me-comments */

describe('lobstercage', function() {
  // lobstercage is also tested by e2e.spec.js, for testing the caching functionality in chrome
  test('readFromCache-unsupported', function(done) {
    expect(window.requestFileSystem).toBe(undefined);

    return expectSaga(lobstercage.readFromCache, 'hello')
      .withState({
        cache: {
          size: 1234
        }
      })
      .run()
      .then(() => {
        done.fail();
      })
      .catch((e) => {
        done();
      });
  });

  test('writeToCache-unsupported', function(done) {
    expect(window.requestFileSystem).toBe(undefined);
    return expectSaga(lobstercage.writeToCache, 'hello')
      .withState({
        cache: {
          size: 1234
        },
        log: {
          lines: [
            {
              lineNumber: 0,
              text: 'hello'
            }
          ],
          colorMap: {},
          isDone: true
        }
      })
      .run()
      .then((result) => {
        expect(result.effects.select).toHaveLength(1);
        done();
      });
  });
});
