import sinon from 'sinon';
import { expectSaga } from 'redux-saga-test-plan';
import * as api from '../api/logkeeper';
import * as evergreenApi from '../api/evergreen';
import * as actions from '../actions';
import logfetchers from './logfetchers';
import { readFromCache, writeToCache } from './lobstercage';

describe('fetchLobster', function() {
  afterEach(() => sinon.restore());

  test('resolves-200', function(done) {
    const resp = new Response(new Blob(['lobster']), { status: 200 });
    const mock = sinon.stub().resolves(resp);
    sinon.replace(api, 'fetchLobster', mock);

    const action = actions.loadLog({
      type: 'lobster',
      server: 'domain.invalid',
      file: 'simple.log'
    });
    const identity = { type: 'lobster', server: 'domain.invalid', file: 'simple.log' };
    return expectSaga(logfetchers, action)
      .run()
      .then((result) => {
        const { effects } = result;
        expect(effects).not.toHaveProperty('take');
        expect(effects.put).toHaveLength(1);

        const v = effects.put[0].PUT.action;
        expect(v.error).toBe(false);
        expect(v.type).toBe(actions.PROCESS_RESPONSE);
        expect(v.payload.type).toBe('resmoke');
        expect(v.payload.data).toBe('lobster');
        expect(v.payload.isDone).toBe(true);

        expect(effects.call).toHaveLength(3);
        expect(effects.call[0].CALL.args).toEqual([identity]);

        expect(result.toJSON()).toMatchSnapshot();

        done();
      });
  });

  test('resolves-404', function(done) {
    const resp = new Response(new Blob(['errol']), { status: 404 });
    const mock = sinon.stub().resolves(resp);
    sinon.replace(api, 'fetchLobster', mock);

    const action = actions.loadLog({
      type: 'lobster',
      server: 'domain.invalid',
      file: 'simple.log'
    });
    const identity = { type: 'lobster', server: 'domain.invalid', file: 'simple.log' };
    return expectSaga(logfetchers, action)
      .run()
      .then((result) => {
        const { effects } = result;
        expect(effects).not.toHaveProperty('take');
        expect(effects.put).toHaveLength(1);

        const v = effects.put[0].PUT.action;
        expect(v.error).toBe(true);
        expect(v.type).toBe(actions.PROCESS_RESPONSE);
        expect(v.payload.type).toBe('resmoke');
        expect(v.payload.data).not.toEqual(null);
        expect(v.payload.isDone).toBe(true);

        expect(effects.call).toHaveLength(3);
        expect(effects.call[0].CALL.args).toEqual([identity]);
        expect(result.toJSON()).toMatchSnapshot();

        done();
      });
  });

  test('rejects', function(done) {
    const mock = sinon.stub().rejects('error');
    sinon.replace(api, 'fetchLobster', mock);

    const action = actions.loadLog({
      type: 'lobster',
      server: 'domain.invalid',
      file: 'simple.log'
    });
    const identity = { type: 'lobster', server: 'domain.invalid', file: 'simple.log' };
    return expectSaga(logfetchers, action)
      .run()
      .then((result) => {
        const { effects } = result;
        expect(effects).not.toHaveProperty('take');
        expect(effects.put).toHaveLength(1);

        const v = effects.put[0].PUT.action;
        expect(v.error).toBe(true);
        expect(v.type).toBe(actions.PROCESS_RESPONSE);
        expect(v.payload.type).toBe('resmoke');
        expect(v.payload.data).not.toEqual(null);
        expect(v.payload.isDone).toBe(true);

        expect(effects.call).toHaveLength(3);
        expect(effects.call[0].CALL.args).toEqual([identity]);
        expect(result.toJSON()).toMatchSnapshot();

        done();
      });
  });
});

describe('fetchLogkeeper', function() {
  afterEach(() => sinon.restore());

  test('resolves-200', function(done) {
    const resp = new Response(new Blob(['logkeeper']), { status: 200 });
    const mock = sinon.stub().resolves(resp);
    sinon.replace(api, 'fetchLogkeeper', mock);

    const identity = {
      type: 'logkeeper',
      build: 'build',
      test: 'test'
    };
    const action = actions.loadLog(identity);
    return expectSaga(logfetchers, action)
      .withState({
        cache: {
          status: 'unsupported'
        }
      })
      .run()
      .then((result) => {
        const { effects } = result;
        expect(effects).not.toHaveProperty('take');
        expect(effects.put).toHaveLength(1);

        const v = effects.put[0].PUT.action;
        expect(v.error).toBe(false);
        expect(v.type).toBe(actions.PROCESS_RESPONSE);
        expect(v.payload.type).toBe('resmoke');
        expect(v.payload.data).toBe('logkeeper');
        expect(v.payload.isDone).toBe(true);

        expect(effects.call).toHaveLength(7);
        expect(effects.call[0].CALL.args).toEqual([identity]);
        expect(effects.call[2].CALL.fn).toBe(readFromCache);
        expect(effects.call[2].CALL.args).toEqual(['fetchLogkeeper-build-test.json']);
        expect(effects.call[5].CALL.fn).toBe(writeToCache);
        expect(effects.call[5].CALL.args).toEqual(['fetchLogkeeper-build-test.json']);

        expect(result.toJSON()).toMatchSnapshot();

        done();
      });
  });

  test('resolves-200-notest', function(done) {
    const resp = new Response(new Blob(['logkeeper']), { status: 200 });
    const mock = sinon.stub().resolves(resp);
    sinon.replace(api, 'fetchLogkeeper', mock);

    const identity = {
      type: 'logkeeper',
      build: 'build'
    };
    const action = actions.loadLog(identity);
    return expectSaga(logfetchers, action)
      .withState({
        cache: {
          status: 'unsupported'
        }
      })
      .run()
      .then((result) => {
        const { effects } = result;
        expect(effects).not.toHaveProperty('take');
        expect(effects.put).toHaveLength(1);

        const v = effects.put[0].PUT.action;
        expect(v.error).toBe(false);
        expect(v.type).toBe(actions.PROCESS_RESPONSE);
        expect(v.payload.type).toBe('resmoke');
        expect(v.payload.data).toBe('logkeeper');
        expect(v.payload.isDone).toBe(true);

        expect(effects.call).toHaveLength(7);
        expect(effects.call[0].CALL.args).toEqual([identity]);
        expect(effects.call[2].CALL.fn).toBe(readFromCache);
        expect(effects.call[2].CALL.args).toEqual(['fetchLogkeeper-build-all.json']);
        expect(effects.call[5].CALL.fn).toBe(writeToCache);
        expect(effects.call[5].CALL.args).toEqual(['fetchLogkeeper-build-all.json']);

        expect(result.toJSON()).toMatchSnapshot();

        done();
      });
  });
});

describe('fetchEvergreen', function() {
  afterEach(() => sinon.restore());

  test('resolves-200-test', function(done) {
    const resp = new Response(new Blob(['evergreen-test']), { status: 200 });
    const mock = sinon.stub().resolves(resp);
    sinon.replace(evergreenApi, 'fetchEvergreen', mock);

    const identity = {
      type: 'evergreen-test',
      id: 'test'
    };
    const action = actions.loadLog(identity);
    return expectSaga(logfetchers, action)
      .withState({
        cache: {
          status: 'unsupported'
        }
      })
      .run()
      .then((result) => {
        const { effects } = result;
        expect(effects).not.toHaveProperty('take');
        expect(effects.put).toHaveLength(1);

        const v = effects.put[0].PUT.action;
        expect(v.error).toBe(false);
        expect(v.type).toBe(actions.PROCESS_RESPONSE);
        expect(v.payload.type).toBe('raw');
        expect(v.payload.data).toBe('evergreen-test');
        expect(v.payload.isDone).toBe(true);

        expect(effects.call).toHaveLength(7);
        expect(effects.call[0].CALL.args).toEqual([identity]);
        expect(effects.call[2].CALL.fn).toBe(readFromCache);
        expect(effects.call[2].CALL.args).toEqual(['fetchEvergreen-test-test.json']);
        expect(effects.call[5].CALL.fn).toBe(writeToCache);
        expect(effects.call[5].CALL.args).toEqual(['fetchEvergreen-test-test.json']);

        expect(result.toJSON()).toMatchSnapshot();

        done();
      });
  });

  test('resolves-200-task', function(done) {
    const resp = new Response(new Blob(['evergreen-task']), { status: 200 });
    const mock = sinon.stub().resolves(resp);
    sinon.replace(evergreenApi, 'fetchEvergreen', mock);

    const identity = {
      type: 'evergreen-task',
      id: 'task',
      execution: 0,
      log: 'all'
    };
    const action = actions.loadLog(identity);
    return expectSaga(logfetchers, action)
      .run()
      .then((result) => {
        const { effects } = result;
        expect(effects).not.toHaveProperty('take');
        expect(effects.put).toHaveLength(1);

        const v = effects.put[0].PUT.action;
        expect(v.error).toBe(false);
        expect(v.type).toBe(actions.PROCESS_RESPONSE);
        expect(v.payload.type).toBe('raw');
        expect(v.payload.data).toBe('evergreen-task');
        expect(v.payload.isDone).toBe(true);

        expect(effects.call).toHaveLength(3);
        expect(effects.call[0].CALL.args).toEqual([identity]);

        expect(result.toJSON()).toMatchSnapshot();

        done();
      });
  });

});
