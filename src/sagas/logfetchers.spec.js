import sinon from 'sinon';
import { expectSaga } from 'redux-saga-test-plan';
import * as api from '../api/logkeeper';
import * as actions from '../actions';
import logfetchers from './logfetchers';

describe('logfetchers', function() {
  afterEach(() => sinon.restore());

  test('fetchLobster-resolves-200', function(done) {
    const resp = new Response(new Blob(['lobster']), { status: 200 });
    const mock = sinon.stub().resolves(resp);
    sinon.replace(api, 'fetchLobster', mock);

    const action = actions.loadLog({
      type: 'lobster',
      server: 'domain.invalid',
      file: 'simple.log'
    });
    const identity = { type: 'lobster', server: 'domain.invalid', file: 'simple.log' };
    expectSaga(logfetchers, action)
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

  test('fetchLobster-resolves-404', function(done) {
    const resp = new Response(new Blob(['errol']), { status: 404 });
    const mock = sinon.stub().resolves(resp);
    sinon.replace(api, 'fetchLobster', mock);

    const action = actions.loadLog({
      type: 'lobster',
      server: 'domain.invalid',
      file: 'simple.log'
    });
    const identity = { type: 'lobster', server: 'domain.invalid', file: 'simple.log' };
    expectSaga(logfetchers, action)
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

