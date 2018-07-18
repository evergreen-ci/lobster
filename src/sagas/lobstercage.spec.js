// @flow

import sinon from 'sinon';
import assert from 'assert';
import * as lobstercage from './lobstercage';
import { runSaga } from 'redux-saga';

/* eslint-disable flowtype/no-flow-fix-me-comments */

describe('lobstercage', function() {
  test('readFromCache-unsupported', function() {
    assert.strictEqual(window.requestFileSystem, undefined);
    const dispatch = sinon.fake();
    const getState = sinon.fake.returns({
      cache: {
        size: 1234
      }
    });
    const options = {
      dispatch: dispatch,
      getState: getState
    };
    const result = runSaga(options, lobstercage.readFromCache, 'hello');
    // $FlowFixMe
    assert.strictEqual(result.isAborted(), true);
  });

  test('writeToCache-unsupported', function() {
    assert.strictEqual(window.requestFileSystem, undefined);
    const dispatch = sinon.fake();
    const getState = sinon.fake.returns({
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
        colorMap: {}
      }
    });
    const options = {
      dispatch: dispatch,
      getState: getState
    };
    const result = runSaga(options, lobstercage.writeToCache, 'hello').done;
    assert.ok(result);
  });
});
