// @flow strict

import type { Filter, Highlight } from '../../models';
import * as merge from './merge';

describe('filters', function() {
  const filters: Filter[] = [
    {
      on: true,
      caseSensitive: false,
      text: 't1',
      inverse: false
    },
    {
      on: false,
      caseSensitive: true,
      text: 't2',
      inverse: false
    },
    {
      on: true,
      caseSensitive: false,
      text: 't3',
      inverse: true
    },
    {
      on: false,
      caseSensitive: true,
      text: 't4',
      inverse: true
    }
  ];

  test('active', function() {
    const f = merge.activeFilters(filters);
    expect(f).toHaveLength(1);
  });


  test('activeInverse', function() {
    const f = merge.activeInverseFilters(filters);
    expect(f).toHaveLength(1);
  });
});

describe('highlights', function() {
  const highlights: Highlight[] = [
    {
      on: true,
      caseSensitive: false,
      text: 't1',
      line: false
    },
    {
      on: false,
      caseSensitive: true,
      text: 't2',
      line: false
    },
    {
      on: true,
      caseSensitive: false,
      text: 't3',
      line: true
    },
    {
      on: false,
      caseSensitive: true,
      text: 't4',
      line: true
    }
  ];

  test('active', function() {
    const f = merge.activeHighlights(highlights);
    expect(f).toHaveLength(2);
  });


  test('activeLines', function() {
    const f = merge.activeHighlightLines(highlights);
    expect(f).toHaveLength(1);
  });
});
