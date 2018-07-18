import sinon from 'sinon';
import assert from 'assert';
import { runSaga } from 'redux-saga';
import * as api from '../api/logkeeper';
import * as actions from '../actions';
import * as sagas from './logfetchers';

describe('lobsterLoadData', function() {
  afterEach(() => sinon.restore());

  test('resolve', function() {
    sinon.replace(api, 'fetchLobster', sinon.stub().resolves(new Response('lobster')));

    const action = actions.lobsterLoadData('localhost:9001', 'a.log');

    const dispatch = sinon.fake();
    const getState = sinon.fake.returns({
      cache: {
        size: 123
      }
    });
    const options = {
      dispatch: dispatch,
      getState: getState
    };
    const result = runSaga(options, sagas.lobsterLoadData, action).done;
    assert.ok(result);

    result.then(function() {
      assert.strictEqual(api.fetchLobster.callCount, 1);
      assert.deepEqual(api.fetchLobster.firstCall.args, ['localhost:9001', 'a.log']);

      assert.strictEqual(dispatch.callCount, 1);
      assert.strictEqual(dispatch.firstCall.args.length, 1);
      assert.strictEqual(dispatch.firstCall.args[0].type, actions.PROCESS_RESPONSE);
      assert.strictEqual(dispatch.firstCall.args[0].payload.data, 'lobster');
      assert.strictEqual(dispatch.firstCall.args[0].error, false);
      assert.strictEqual(dispatch.lastCall.args[0].payload.isDone, true);
    });
  });

  test('fail', function() {
    sinon.replace(api, 'fetchLobster', sinon.stub().rejects('error'));

    const action = actions.lobsterLoadData('localhost:9001', 'a.log');
    const dispatch = sinon.fake();
    const result = runSaga({dispatch: dispatch}, sagas.lobsterLoadData, action).done;
    assert.ok(result);
    result.then(function() {
      assert.strictEqual(api.fetchLobster.callCount, 1);
      assert.deepEqual(api.fetchLobster.firstCall.args, ['localhost:9001', 'a.log']);

      assert.strictEqual(dispatch.callCount, 1);
      assert.strictEqual(dispatch.firstCall.args[0].type, actions.PROCESS_RESPONSE);
      assert.strictEqual(dispatch.firstCall.args[0].error, true);
    });
  });
});

describe('logkeeperLoadData', function() {
  afterEach(() => sinon.restore());

  test('resolve', function() {
    sinon.replace(api, 'fetchLogkeeper', sinon.stub().resolves(new Response('logkeeper')));

    const action = actions.logkeeperLoadData('build0', 'test0');
    const dispatch = sinon.fake();
    const getState = sinon.fake.returns({
      cache: {
        size: 123
      }
    });
    const result = runSaga({dispatch: dispatch, getState: getState}, sagas.logkeeperLoadData, action).done;
    assert.ok(result);

    result.then(function() {
      assert.strictEqual(api.fetchLogkeeper.callCount, 1);
      assert.deepEqual(api.fetchLogkeeper.firstCall.args, ['build0', 'test0']);

      assert.strictEqual(dispatch.callCount, 1);
      assert.strictEqual(dispatch.firstCall.args.length, 1);
      assert.strictEqual(dispatch.firstCall.args[0].type, actions.PROCESS_RESPONSE);
      assert.strictEqual(dispatch.firstCall.args[0].payload.data, 'logkeeper');
      assert.strictEqual(dispatch.firstCall.args[0].error, false);
      assert.strictEqual(dispatch.lastCall.args[0].payload.isDone, true);
    });
  });

  test('resolve-error', function() {
    sinon.replace(api, 'fetchLogkeeper', sinon.stub().resolves(new Response('nope logkeeper', {status: 500})));

    const action = actions.logkeeperLoadData('build0');
    const dispatch = sinon.fake();
    const getState = sinon.fake.returns({
      cache: {
        size: 123
      }
    });
    const result = runSaga({dispatch: dispatch, getState: getState}, sagas.logkeeperLoadData, action).done;
    assert.ok(result);

    result.then(function() {
      assert.strictEqual(api.fetchLogkeeper.callCount, 1);
      assert.deepEqual(api.fetchLogkeeper.firstCall.args, ['build0', undefined]);

      assert.strictEqual(dispatch.callCount, 1);
      assert.strictEqual(dispatch.firstCall.args.length, 1);
      assert.strictEqual(dispatch.firstCall.args[0].type, actions.PROCESS_RESPONSE);

      dispatch.firstCall.args[0].payload.data.text().then(function(text) {
        assert.strictEqual(text, 'nope logkeeper');
      });
      assert.strictEqual(dispatch.firstCall.args[0].error, true);
    });
  });

  test('reject', function() {
    sinon.replace(api, 'fetchLogkeeper', sinon.stub().rejects('error'));

    const action = actions.logkeeperLoadData('build0', 'test0');
    const dispatch = sinon.fake();
    const getState = sinon.fake.returns({
      cache: {
        size: 123
      }
    });
    const result = runSaga({dispatch: dispatch, getState: getState}, sagas.logkeeperLoadData, action).done;
    assert.ok(result);

    result.then(function() {
      assert.strictEqual(api.fetchLogkeeper.callCount, 1);
      assert.deepEqual(api.fetchLogkeeper.firstCall.args, ['build0', 'test0']);

      assert.strictEqual(dispatch.callCount, 1);
      assert.strictEqual(dispatch.firstCall.args.length, 1);
      assert.strictEqual(dispatch.firstCall.args[0].type, actions.PROCESS_RESPONSE);
      assert.strictEqual(dispatch.firstCall.args[0].error, true);
    });
  });
});
