import settings from './settings';
import * as actions from '../../actions/logviewer';

describe('settings', function() {
  const initialState = {
    wrap: false,
    caseSensitive: false,
    filterIntersection: false
  };

  test('line-wrap', function() {
    const action = actions.toggleLineWrap();

    const state0 = settings(initialState, action);
    expect(state0.wrap).toBe(true);
    expect(state0.caseSensitive).toBe(false);
    expect(state0.filterIntersection).toBe(false);

    expect(window.localStorage.getItem('lobster-line-wrap')).toBe('true');

    const state1 = settings(state0, action);
    expect(state1.wrap).toBe(false);
    expect(state1.caseSensitive).toBe(false);
    expect(state1.filterIntersection).toBe(false);
    expect(window.localStorage.getItem('lobster-line-wrap')).toBe('false');
  });

  test('case-sensitivity', function() {
    const action = actions.toggleCaseSensitivity();

    const state0 = settings(initialState, action);
    expect(state0.wrap).toBe(false);
    expect(state0.caseSensitive).toBe(true);
    expect(state0.filterIntersection).toBe(false);

    const state1 = settings(state0, action);
    expect(state1.wrap).toBe(false);
    expect(state1.caseSensitive).toBe(false);
    expect(state1.filterIntersection).toBe(false);
  });

  test('filter-intersection', function() {
    const action = actions.toggleFilterIntersection();

    const state0 = settings(initialState, action);
    expect(state0.wrap).toBe(false);
    expect(state0.caseSensitive).toBe(false);
    expect(state0.filterIntersection).toBe(true);

    const state1 = settings(state0, action);
    expect(state1.wrap).toBe(false);
    expect(state1.caseSensitive).toBe(false);
    expect(state1.filterIntersection).toBe(false);
  });
});
