import settings from './settings';
import * as actions from '../actions';
import assert from 'assert';

describe('settings', function() {
  const initialState = {
    wrap: false,
    caseSensitive: false,
    filterIntersection: false
  };

  test('line-wrap', function() {
    const action = actions.toggleLineWrap();

    const state0 = settings(initialState, action);
    assert.deepEqual(state0.wrap, true);
    assert.deepEqual(state0.caseSensitive, false);
    assert.deepEqual(state0.filterIntersection, false);

    const state1 = settings(state0, action);
    assert.deepEqual(state1.wrap, false);
    assert.deepEqual(state1.caseSensitive, false);
    assert.deepEqual(state1.filterIntersection, false);
  });

  test('case-sensitivity', function() {
    const action = actions.toggleCaseSensitivity();

    const state0 = settings(initialState, action);
    assert.deepEqual(state0.wrap, false);
    assert.deepEqual(state0.caseSensitive, true);
    assert.deepEqual(state0.filterIntersection, false);

    const state1 = settings(state0, action);
    assert.deepEqual(state1.wrap, false);
    assert.deepEqual(state1.caseSensitive, false);
    assert.deepEqual(state1.filterIntersection, false);
  });

  test('filter-intersection', function() {
    const action = actions.toggleFilterIntersection();

    const state0 = settings(initialState, action);
    assert.deepEqual(state0.wrap, false);
    assert.deepEqual(state0.caseSensitive, false);
    assert.deepEqual(state0.filterIntersection, true);

    const state1 = settings(state0, action);
    assert.deepEqual(state1.wrap, false);
    assert.deepEqual(state1.caseSensitive, false);
    assert.deepEqual(state1.filterIntersection, false);
  });
});
