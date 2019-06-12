// @flow

import search from './search';
import type { ReduxState } from 'src/models';

test('lines are filtered correctly', () => {
    const searchString = 'foo';
    const logLines = [
        { lineNumber: 0, text: 'one' },
        { lineNumber: 1, text: 'foo' },
        { lineNumber: 2, text: 'foo two' },
        { lineNumber: 3, text: 'idk' },
        { lineNumber: 4, text: 'hello' },
        { lineNumber: 5, text: 'tell me a foo' },
    ];
    const state: ReduxState = {
        cache: {
            size: 0,
            status: 'never'
        },
        log: {
            colorMap: {},
            events: [],
            identity: null,
            isDone: false,
            lines: logLines
        },
        logviewer: {
            bookmarks: [],
            filters: [],
            find: {
                findIdx: -1,
                searchTerm: searchString,
                regexError: null
            },
            highlights: [],
            scrollLine: 0,
            settings: {
                caseSensitive: false,
                expandableRows: true,
                filterIntersection: true,
                wrap: false
            },
            settingsPanel: false
        }
    };

    const results = search(state);
    expect(results).toEqual([1, 2, 5]);
})
