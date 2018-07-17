// @flow strict

import assert from 'assert';
import { logkeeperDataResponse } from './logkeeper';
import { logkeeperDataSuccess, logkeeperDataError } from '../actions';

describe('log', function() {
  test('store-line-gitref', function() {
    const data = [
      'line0',
      'line1'
    ];

    const state = logkeeperDataResponse(undefined, logkeeperDataSuccess(data.join('\n'), 'resmoke'));

    assert.deepEqual(state.lines.length, 2);
    assert.deepEqual(Object.keys(state.colorMap).length, 0);
  });

  test('logkeeperDataResponse-error', function() {
    const action = logkeeperDataError('error');
    const state = logkeeperDataResponse(undefined, action);
    assert.deepEqual(state.lines.length, 0);
    assert.deepEqual(state.colorMap.size, 0);
  });
});
