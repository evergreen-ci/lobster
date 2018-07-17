
import assert from 'assert';
import raw from './raw';

describe('raw', function() {
  test('unix-newlines', function() {
    const lines = [
      'line0',
      '',
      'line1',
      ''
    ];
    const state = raw('\n')(lines.join('\n'));
    assert.deepEqual(state.colorMap, {});
    assert.strictEqual(state.lines.length, 3);

    assert.strictEqual(state.lines[0].lineNumber, 0);
    assert.strictEqual(state.lines[0].text, 'line0');
    assert.strictEqual(state.lines[0].port, null);
    assert.strictEqual(state.lines[0].gitRef, null);

    assert.strictEqual(state.lines[1].lineNumber, 1);
    assert.strictEqual(state.lines[1].text, '');
    assert.strictEqual(state.lines[1].port, null);
    assert.strictEqual(state.lines[1].gitRef, null);

    assert.strictEqual(state.lines[2].lineNumber, 2);
    assert.strictEqual(state.lines[2].text, 'line1');
    assert.strictEqual(state.lines[2].port, null);
    assert.strictEqual(state.lines[2].gitRef, null);
  });
});
