import assert from 'assert';
import sinon from 'sinon';
import * as logkeeper from './logkeeper';

describe('api-logkeeper', function() {
  afterEach(() => sinon.restore());

  test('fetchLobster', function() {
    const fake = sinon.fake();
    sinon.replace(window, 'fetch', fake);
    logkeeper.fetchLobster('localhost:9001', 'a.log');

    assert.deepEqual(fake.callCount, 1);
    assert.deepEqual(fake.lastCall.args[0]._bodyInit, '{\"url\":\"a.log\"}');
    assert.deepEqual(fake.lastCall.args[0].headers.map['content-type'], 'application/json');
  });

  test('fetchLogkeeper', function() {
    const fake = sinon.fake();
    sinon.replace(window, 'fetch', fake);
    logkeeper.fetchLogkeeper('build');

    assert.deepEqual(fake.callCount, 1);
    assert.deepEqual(fake.lastCall.args[0]._bodyInit, undefined);
    assert.deepEqual(fake.lastCall.args[0].method, 'GET');
    assert.deepEqual(fake.lastCall.args[0].url, 'http://domain.invalid/build/build/all?raw=1');

    logkeeper.fetchLogkeeper('build', '');
    assert.deepEqual(fake.callCount, 2);
    assert.deepEqual(fake.lastCall.args[0]._bodyInit, undefined);
    assert.deepEqual(fake.lastCall.args[0].method, 'GET');
    assert.deepEqual(fake.lastCall.args[0].url, 'http://domain.invalid/build/build/all?raw=1');

    logkeeper.fetchLogkeeper('build', 'test');
    assert.deepEqual(fake.callCount, 3);
    assert.deepEqual(fake.lastCall.args[0]._bodyInit, undefined);
    assert.deepEqual(fake.lastCall.args[0].method, 'GET');
    assert.deepEqual(fake.lastCall.args[0].url, 'http://domain.invalid/build/build/test/test?raw=1');
  });
});
