import sinon from 'sinon';
import cache from './cache';
import { setCache } from '../actions';

describe('setupCache', function() {
  afterEach(() => {
    sinon.restore();
    window.localStorage.clear();
  });

  test('ok', function() {
    cache(undefined, setCache('ok', 9001));
    expect(window.localStorage.getItem('lobster-cache-status')).toBe('ok');
    expect(window.localStorage.getItem('lobster-cache-size')).toBe('9001');
  });

  test('never', function() {
    cache(undefined, setCache('never', 9001));
    expect(window.localStorage.getItem('lobster-cache-status')).toBe('never');
    expect(window.localStorage.getItem('lobster-cache-size')).toBe(null);
  });

  test('later', function() {
    cache(undefined, setCache('later', 9001));
    expect(window.localStorage.getItem('lobster-cache-status')).toBe(null);
    expect(window.localStorage.getItem('lobster-cache-size')).toBe(null);
  });

  test('null', function() {
    cache(undefined, setCache(null, 9001));
    expect(window.localStorage.getItem('lobster-cache-status')).toBe(null);
    expect(window.localStorage.getItem('lobster-cache-size')).toBe(null);
  });

  test('error', function() {
    cache(undefined, setCache('error', 9001));
    expect(window.localStorage.getItem('lobster-cache-status')).toBe(null);
    expect(window.localStorage.getItem('lobster-cache-size')).toBe(null);
  });

  test('unsupported', function() {
    cache(undefined, setCache('unsupported', 9001));
    expect(window.localStorage.getItem('lobster-cache-status')).toBe(null);
    expect(window.localStorage.getItem('lobster-cache-size')).toBe(null);
  });
});
