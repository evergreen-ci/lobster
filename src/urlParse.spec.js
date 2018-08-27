// @flow

import urlParse from './urlParse';

describe('urlParse', function() {
  test('multi-filter', function() {
    const queryParams = '?f~=110~text&f~=100~text&f=110~~doop&h=001~~boop';
    const hash = '#f~=010~text&f~=010~text&l=0&h~=011~doop';

    const out = urlParse(hash, queryParams);
    expect([...out.filters])
      .toEqual(expect.arrayContaining([
        {
          text: 'text',
          on: false,
          inverse: true,
          caseSensitive: false
        },
        {
          text: '0~~doop',
          on: true,
          inverse: true,
          caseSensitive: false
        }
      ]));

    expect([...out.highlights])
      .toEqual(expect.arrayContaining([
        {
          text: 'doop',
          on: false,
          line: true,
          caseSensitive: true
        },
        {
          text: '1~~boop',
          on: false,
          line: false,
          caseSensitive: false
        }
      ]));
  });
});

describe('urlParse-legacy', function() {
  test('merge', function() {
    const queryParams = 'http://domain.invalid/?scroll=99&bookmarks=0,1,2&url=urlserver&server=serverserver';
    const hash = '#scroll=0&bookmarks=2,4,5&url=urlhash&server=serverhash';

    const out = urlParse(hash, queryParams);
    expect(out.scroll).toBe(0);
    expect([...out.bookmarks]).toEqual(expect.arrayContaining([0, 1, 2, 4, 5]));
    expect(out.url).toBe('urlhash');
    expect(out.server).toBe('serverhash');
  });

  test('multi-highlight', function() {
    const queryParams = '?h=11text&h=10text&h=11doop&f=01doop';
    const hash = '#h=01text&h=01text';

    const out = urlParse(hash, queryParams);
    expect([...out.highlights])
      .toEqual(expect.arrayContaining([
        {
          text: 'text',
          on: false,
          line: true,
          caseSensitive: false
        },
        {
          text: 'doop',
          on: true,
          line: true,
          caseSensitive: false
        }
      ]));

    expect([...out.filters])
      .toEqual(expect.arrayContaining([
        {
          text: 'doop',
          on: false,
          inverse: true,
          caseSensitive: false
        }
      ]));
    expect(out.url).toBe(undefined);
    expect(out.server).toBe(undefined);
  });

  test('multi-filter', function() {
    const queryParams = '?f=11text&f=10text&f=11doop&h=01doop';
    const hash = '#f=01text&f=01text';

    const out = urlParse(hash, queryParams);
    expect([...out.filters])
      .toEqual(expect.arrayContaining([
        {
          text: 'text',
          on: false,
          inverse: true,
          caseSensitive: false
        },
        {
          text: 'doop',
          on: true,
          inverse: true,
          caseSensitive: false
        }
      ]));

    expect([...out.highlights])
      .toEqual(expect.arrayContaining([
        {
          text: 'doop',
          on: false,
          line: true,
          caseSensitive: false
        }
      ]));
  });

  test('single', function() {
    const queryParams = '?h=10doop';
    const hash = '#f=01text';

    const out = urlParse(hash, queryParams);
    expect([...out.filters])
      .toEqual([
        {
          text: 'text',
          on: false,
          inverse: true,
          caseSensitive: false
        }
      ]);
    expect([...out.highlights])
      .toEqual([
        {
          text: 'doop',
          on: true,
          line: false,
          caseSensitive: false
        }
      ]);
  });

  test('bad-filter-and-highlight', function() {
    const queryParams = '?h=doop&h';
    const hash = '#f=text';

    const out = urlParse(hash, queryParams);
    expect([...out.filters]).toHaveLength(0);
    expect([...out.highlights]).toHaveLength(0);
  });

  test('bad-bookmarks', function() {
    const values = ['?bookmarks=', '?bookmarks', '?', '', undefined, null];
    values.forEach((queryParams) => {
      values.forEach((hash) => {
        const out = urlParse(hash, queryParams);
        expect([...out.filters]).toHaveLength(0);
        expect([...out.highlights]).toHaveLength(0);
      });
    });

    [null, '?bookmarks=randomtext', '?bookmarks=ra,n,domt,ext!']
      .forEach((value) => {
        const out = urlParse(null, value);
        expect(out.bookmarks).toEqual(new Set());
      });
  });

  test('bad-scroll', function() {
    const values = ['?scroll=', '?scroll', '?', '', undefined, null, '?scroll=zippitydoodah', '?scroll=-5'];
    values.forEach((queryParams) => {
      values.forEach((hash) => {
        const out = urlParse(hash, queryParams);
        expect(out.scroll).toBe(undefined);
      });
    });
  });
});

