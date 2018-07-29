import raw from './raw';

describe('raw', function() {
  test('unix-newlines', function() {
    const inState = {
      identity: {
        type: 'raw',
        build: 'build1'
      },
      lines: [],
      colorMap: new Map(),
      isDone: false
    };
    const lines = [
      'line0',
      '',
      'line1',
      ''
    ];
    const state = raw('\n')(inState, lines.join('\n'));
    expect(state.colorMap).toEqual({});
    expect(state.lines.length).toBe(3);

    expect(state.lines[0].lineNumber).toBe(0);
    expect(state.lines[0].text).toBe('line0');
    expect(state.lines[0].port).toBe(null);
    expect(state.lines[0].gitRef).toBe(null);

    expect(state.lines[1].lineNumber).toBe(1);
    expect(state.lines[1].text).toBe('');
    expect(state.lines[1].port).toBe(null);
    expect(state.lines[1].gitRef).toBe(null);

    expect(state.lines[2].lineNumber).toBe(2);
    expect(state.lines[2].text.toBe('line1');
    expect(state.lines[2].port.toBe(null);
    expect(state.lines[2].gitRef.toBe(null);

    expect(state.identity).toBe(inState.identity);
  });
});
