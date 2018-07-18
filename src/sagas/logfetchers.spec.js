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
    const result = runSaga({dispatch: dispatch}, sagas.lobsterLoadData, action).done;
    assert.ok(result);

    result.then(function() {
      assert.deepEqual(api.fetchLobster.callCount, 1);
      assert.deepEqual(api.fetchLobster.firstCall.args, ['localhost:9001', 'a.log']);

      assert.deepEqual(dispatch.callCount, 1);
      assert.deepEqual(dispatch.firstCall.args.length, 1);
      assert.deepEqual(dispatch.firstCall.args[0].type, actions.LOGKEEPER_LOAD_RESPONSE);
      assert.deepEqual(dispatch.firstCall.args[0].payload.data, 'lobster');
      assert.deepEqual(dispatch.firstCall.args[0].error, false);
      assert.deepEqual(dispatch.lastCall.args[0].payload.isDone, true);
    });
  });

  test('fail', function() {
    sinon.replace(api, 'fetchLobster', sinon.stub().rejects('error'));

    const action = actions.lobsterLoadData('localhost:9001', 'a.log');
    const dispatch = sinon.fake();
    const result = runSaga({dispatch: dispatch}, sagas.lobsterLoadData, action).done;
    assert.ok(result);
    result.then(function() {
      assert.deepEqual(api.fetchLobster.callCount, 1);
      assert.deepEqual(api.fetchLobster.firstCall.args, ['localhost:9001', 'a.log']);

      assert.deepEqual(dispatch.callCount, 1);
      assert.deepEqual(dispatch.firstCall.args[0].type, actions.LOGKEEPER_LOAD_RESPONSE);
      assert.deepEqual(dispatch.firstCall.args[0].error, true);
    });
  });
});

describe('logkeeperLoadData', function() {
  afterEach(() => sinon.restore());

  test('resolve', function() {
    sinon.replace(api, 'fetchLogkeeper', sinon.stub().resolves(new Response('logkeeper')));

    const action = actions.loadData('build0', 'test0');
    const dispatch = sinon.fake();
    const result = runSaga({dispatch: dispatch}, sagas.logkeeperLoadData, action).done;
    assert.ok(result);

    result.then(function() {
      assert.deepEqual(api.fetchLogkeeper.callCount, 1);
      assert.deepEqual(api.fetchLogkeeper.firstCall.args, ['build0', 'test0']);

      assert.deepEqual(dispatch.callCount, 1);
      assert.deepEqual(dispatch.firstCall.args.length, 1);
      assert.deepEqual(dispatch.firstCall.args[0].type, actions.LOGKEEPER_LOAD_RESPONSE);
      assert.deepEqual(dispatch.firstCall.args[0].payload.data, 'logkeeper');
      assert.deepEqual(dispatch.firstCall.args[0].error, false);
      assert.deepEqual(dispatch.lastCall.args[0].payload.isDone, true);
    });
  });

  test('resolve-error', function() {
    sinon.replace(api, 'fetchLogkeeper', sinon.stub().resolves(new Response('nope logkeeper', {status: 500})));

    const action = actions.loadData('build0');
    const dispatch = sinon.fake();
    const result = runSaga({dispatch: dispatch}, sagas.logkeeperLoadData, action).done;
    assert.ok(result);

    result.then(function() {
      assert.deepEqual(api.fetchLogkeeper.callCount, 1);
      assert.deepEqual(api.fetchLogkeeper.firstCall.args, ['build0', undefined]);

      assert.deepEqual(dispatch.callCount, 1);
      assert.deepEqual(dispatch.firstCall.args.length, 1);
      assert.deepEqual(dispatch.firstCall.args[0].type, actions.LOGKEEPER_LOAD_RESPONSE);

      dispatch.firstCall.args[0].payload.data.text().then(function(text) {
        assert.deepEqual(text, 'nope logkeeper');
      });
      assert.deepEqual(dispatch.firstCall.args[0].error, true);
    });
  });

  test('reject', function() {
    sinon.replace(api, 'fetchLogkeeper', sinon.stub().rejects('error'));

    const action = actions.loadData('build0', 'test0');
    const dispatch = sinon.fake();
    const result = runSaga({dispatch: dispatch}, sagas.logkeeperLoadData, action).done;
    assert.ok(result);

    result.then(function() {
      assert.deepEqual(api.fetchLogkeeper.callCount, 1);
      assert.deepEqual(api.fetchLogkeeper.firstCall.args, ['build0', 'test0']);

      assert.deepEqual(dispatch.callCount, 1);
      assert.deepEqual(dispatch.firstCall.args.length, 1);
      assert.deepEqual(dispatch.firstCall.args[0].type, actions.LOGKEEPER_LOAD_RESPONSE);
      assert.deepEqual(dispatch.firstCall.args[0].error, true);
    });
  });
});
