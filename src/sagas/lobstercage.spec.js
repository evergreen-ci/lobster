// @flow

import sinon from 'sinon';
import * as lobstercage from './lobstercage';
import { runSaga } from 'redux-saga';

/* eslint-disable flowtype/no-flow-fix-me-comments */

describe('lobstercage', function() {
  test('readFromCache-unsupported', function() {
    expect(window.requestFileSystem).toBe(undefined);
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
    expect(result.isAborted()).toBe(true);
  });

  test('writeToCache-unsupported', function() {
    expect(window.requestFileSystem).toBe(undefined);
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
    return expect(result).toBe(true);
  });
});
