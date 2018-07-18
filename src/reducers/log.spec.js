// @flow strict

import assert from 'assert';
import reducer from './processData';
import { processData, processDataError } from '../actions';

describe('log', function() {
  test('store-line-gitref', function() {
    const data = [
      'line0',
      'line1'
    ];

    const state = reducer(undefined, processData(data.join('\n'), 'resmoke'));

    assert.deepEqual(state.lines.length, 2);
    assert.deepEqual(Object.keys(state.colorMap).length, 0);
  });

  test('logkeeperDataResponse-error', function() {
    const action = processDataError('error');
    const state = reducer(undefined, action);
    assert.deepEqual(state.lines.length, 0);
    assert.deepEqual(state.colorMap.size, 0);
  });
});
