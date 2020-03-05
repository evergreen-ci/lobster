// @flow

import search from './search';
import type { ReduxState } from 'src/models';

test('lines are filtered correctly', () => {
    const searchString = 'foo';
    const logLines = [
        { lineNumber: 0, text: 'one', originalText: 'one', isMatched: true },
        { lineNumber: 1, text: 'foo', originalText: 'foo', isMatched: true },
        { lineNumber: 2, text: 'foo two', originalText: 'foo two', isMatched: true },
        { lineNumber: 3, text: 'idk', originalText: 'idk', isMatched: true },
        { lineNumber: 4, text: 'hello', originalText: 'hello', isMatched: true },
        { lineNumber: 5, text: 'tell me a foo', originalText: 'tell me a foo', isMatched: true }
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
                regexError: null,
                startRange: 0,
                endRange: -1
            },
            highlights: [],
            scrollLine: 0,
            settings: {
                caseSensitive: false,
                expandableRows: true,
                filterIntersection: true,
                wrap: false,
                parseResmokeJson: false
            },
            settingsPanel: false
        }
    };

    const results = search(state);
    expect(results).toEqual([1, 2, 5]);
})
