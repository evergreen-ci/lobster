import urlParse from './urlParse';

describe('urlParse', function() {
  test('merge', function() {
    const queryParams = '?scroll=99&bookmarks=0,1,2';
    const hash = '#scroll=0&bookmarks=2,4,5';

    const out = urlParse(hash, queryParams);
    expect(out.scrollToLine).toBe(0);
    expect([...out.bookmarks]).toEqual(expect.arrayContaining([0, 1, 2, 4, 5]));
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
          line: true
        },
        {
          text: 'doop',
          on: true,
          line: true
        }
      ]));

    expect([...out.filters])
      .toEqual(expect.arrayContaining([
        {
          text: 'doop',
          on: false,
          inverse: true
        }
      ]));
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
          inverse: true
        },
        {
          text: 'doop',
          on: true,
          inverse: true
        }
      ]));

    expect([...out.highlights])
      .toEqual(expect.arrayContaining([
        {
          text: 'doop',
          on: false,
          line: true
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
          inverse: true
        }
      ]);
    expect([...out.highlights])
      .toEqual([
        {
          text: 'doop',
          on: true,
          line: false
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
    const values = ['?scroll=', '?scroll', '?', '', undefined, null, '?scroll=zippitydoodah'];
      values.forEach((queryParams) => {
        values.forEach((hash) => {
          const out = urlParse(hash, queryParams);
          expect(out.scrollToLine).toBe(undefined);
        });
      });
  });
});
