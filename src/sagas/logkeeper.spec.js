// @flow

import sinon from 'sinon';
import assert from 'assert';
import { runSaga } from 'redux-saga';
import * as api from '../api/logkeeper';
import * as actions from '../actions';
import * as sagas from './logkeeper';

describe('lobsterLoadData', function() {
  afterEach(() => sinon.restore());

  test('resolve', function() {
    const stub = sinon.replace(api, 'fetchLobster', sinon.stub().resolves({
      data: 'lobster'
    }));

    const action: actions.LobsterLoadData = {
      type: actions.LOBSTER_LOAD_DATA,
      payload: {
        url: 'a.log',
        server: 'localhost:9001'
      },
    }
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
    });
  })

  test('fail', function() {
    const stub = sinon.replace(api, 'fetchLobster', sinon.stub().rejects("error"));

    const action: actions.LobsterLoadData = {
      type: actions.LOBSTER_LOAD_DATA,
      payload: {
        url: 'a.log',
        server: 'localhost:9001'
      },
    }
    const dispatch = sinon.fake();
    const result = runSaga({dispatch: dispatch}, sagas.lobsterLoadData, action).done;
    result.then(function() {
      assert.deepEqual(api.fetchLobster.callCount, 1);
      assert.deepEqual(api.fetchLobster.firstCall.args, ['localhost:9001', 'a.log']);

      assert.deepEqual(dispatch.callCount, 1);
      assert.deepEqual(dispatch.firstCall.args[0].type, actions.LOGKEEPER_LOAD_RESPONSE);
      assert.deepEqual(dispatch.firstCall.args[0].error, true);
    })
  })
})
