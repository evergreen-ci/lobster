import sinon from 'sinon';
import assert from 'assert';
import cache from './cache';
import { setCache } from '../actions';

describe('setupCache', function() {
  afterEach(() => {
    sinon.restore();
    window.localStorage.clear();
  });

  test('ok', function() {
    cache(undefined, setCache('ok', 9001));
    assert.strictEqual(window.localStorage.getItem('lobster-cache-status'), 'ok');
    assert.strictEqual(window.localStorage.getItem('lobster-cache-size'), '9001');
  });

  test('never', function() {
    cache(undefined, setCache('never', 9001));
    assert.strictEqual(window.localStorage.getItem('lobster-cache-status'), 'never');
    assert.strictEqual(window.localStorage.getItem('lobster-cache-size'), null);
  });

  test('later', function() {
    cache(undefined, setCache('later', 9001));
    assert.strictEqual(window.localStorage.getItem('lobster-cache-status'), null);
    assert.strictEqual(window.localStorage.getItem('lobster-cache-size'), null);
  });

  test('null', function() {
    cache(undefined, setCache(null, 9001));
    assert.strictEqual(window.localStorage.getItem('lobster-cache-status'), null);
    assert.strictEqual(window.localStorage.getItem('lobster-cache-size'), null);
  });

  test('error', function() {
    cache(undefined, setCache('error', 9001));
    assert.strictEqual(window.localStorage.getItem('lobster-cache-status'), null);
    assert.strictEqual(window.localStorage.getItem('lobster-cache-size'), null);
  });

  test('unsupported', function() {
    cache(undefined, setCache('unsupported', 9001));
    assert.strictEqual(window.localStorage.getItem('lobster-cache-status'), null);
    assert.strictEqual(window.localStorage.getItem('lobster-cache-size'), null);
  });
});
