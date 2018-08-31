import sinon from 'sinon';
import * as logkeeper from './logkeeper';

describe('api-logkeeper', function() {
  afterEach(() => sinon.restore());

  test('fetchLobster', (done) => {
    sinon.replace(window, 'fetch', (req) => {
      expect(req.url).toBe('http://localhost:9001');
      expect(req.method).toBe('POST');
      expect(req.headers.map['content-type']).toBe('application/json');
      expect(req.text()).resolves.toBe('{"url":"a.log"}');
      done();
      return Promise.resolve('y');
    });
    return expect(logkeeper.fetchLobster('localhost:9001', 'a.log')).resolves.toBe('y');
  });

  test('fetchLogkeeper-build-notest', function(done) {
    sinon.replace(window, 'fetch', (req) => {
      expect(req.url).toBe('http://domain.invalid/build/build1/all?raw=1');
      expect(req.method).toBe('GET');
      done();
      return Promise.resolve('x');
    });
    return expect(logkeeper.fetchLogkeeper('build1')).resolves.toBe('x');
  });

  test('fetchLogkeeper-build-emptytest', function(done) {
    sinon.replace(window, 'fetch', (req) => {
      expect(req.url).toBe('http://domain.invalid/build/build1/all?raw=1');
      expect(req.method).toBe('GET');
      done();
      return Promise.resolve('z');
    });
    return expect(logkeeper.fetchLogkeeper('build1', '')).resolves.toBe('z');
  });

  test('fetchLogkeeper-build-test', function(done) {
    sinon.replace(window, 'fetch', (req) => {
      expect(req.url).toBe('http://domain.invalid/build/build1/test/test1?raw=1');
      expect(req.method).toBe('GET');
      done();
      return Promise.resolve('z');
    });
    return expect(logkeeper.fetchLogkeeper('build1', 'test1')).resolves.toBe('z');
  });
});
