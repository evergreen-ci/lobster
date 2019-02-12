import settings from './settings';
import * as actions from '../../actions/logviewer';

describe('settings', function() {
  const initialState = {
    wrap: false,
    caseSensitive: false,
    filterIntersection: false,
    expandableRows: true,
  };

  test('line-wrap', function() {
    const action = actions.toggleLineWrap();

    const state0 = settings(initialState, action);
    expect(state0.wrap).toBe(true);
    expect(state0.caseSensitive).toBe(false);
    expect(state0.filterIntersection).toBe(false);
    expect(state0.expandableRows).toBe(true);

    expect(window.localStorage.getItem('lobster-line-wrap')).toBe('true');

    const state1 = settings(state0, action);
    expect(state1.wrap).toBe(false);
    expect(state1.caseSensitive).toBe(false);
    expect(state1.filterIntersection).toBe(false);
    expect(state0.expandableRows).toBe(true);
    expect(window.localStorage.getItem('lobster-line-wrap')).toBe('false');
  });

  test('case-sensitivity', function() {
    const action = actions.toggleCaseSensitivity();

    const state0 = settings(initialState, action);
    expect(state0.wrap).toBe(false);
    expect(state0.caseSensitive).toBe(true);
    expect(state0.filterIntersection).toBe(false);
    expect(state0.expandableRows).toBe(true);

    const state1 = settings(state0, action);
    expect(state1.wrap).toBe(false);
    expect(state1.caseSensitive).toBe(false);
    expect(state1.filterIntersection).toBe(false);
    expect(state0.expandableRows).toBe(true);
  });

  test('filter-intersection', function() {
    const action = actions.toggleFilterIntersection();

    const state0 = settings(initialState, action);
    expect(state0.wrap).toBe(false);
    expect(state0.caseSensitive).toBe(false);
    expect(state0.filterIntersection).toBe(true);
    expect(state0.expandableRows).toBe(true);

    const state1 = settings(state0, action);
    expect(state1.wrap).toBe(false);
    expect(state1.caseSensitive).toBe(false);
    expect(state1.filterIntersection).toBe(false);
    expect(state0.expandableRows).toBe(true);
  });

  test('expandable-rows', function() {
    const state0 = initialState
    expect(state0.wrap).toBe(false);
    expect(state0.caseSensitive).toBe(false);
    expect(state0.filterIntersection).toBe(false);
    expect(state0.expandableRows).toBe(true);
    expect(window.localStorage.getItem('lobster-expabable-rows')).toBe(null);

    const action = actions.toggleExpandableRows();

    const state1 = settings(initialState, action);
    expect(state1.wrap).toBe(false);
    expect(state1.caseSensitive).toBe(false);
    expect(state1.filterIntersection).toBe(false);
    expect(state1.expandableRows).toBe(false);
    expect(window.localStorage.getItem('lobster-expandable-rows')).toBe('false');

    const state2 = settings(state1, action);
    expect(state2.wrap).toBe(false);
    expect(state2.caseSensitive).toBe(false);
    expect(state2.filterIntersection).toBe(false);
    expect(state2.expandableRows).toBe(true);
    expect(window.localStorage.getItem('lobster-expandable-rows')).toBe('true');
  });
});
