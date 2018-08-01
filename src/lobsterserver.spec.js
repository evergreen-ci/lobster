import fs from 'fs';
import { tmpdir } from 'os';
import { spawn } from 'child_process';
import path from 'path';
import fetch from 'node-fetch';
import sinon from 'sinon';
import * as api from './api';

function lobster(port = 9000, file = 'simple.log') {
  return fetch(`http://localhost:${port}/api/log`, {
    method: 'POST',
    body: JSON.stringify({ url: file }),
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Origin': 'http://localhost'
    }
  });
}

function startServer(args) {
  try {
    return spawn('node', [path.dirname(__dirname) + '/server', ...args], {
      stdio: 'inherit'
    });
  } catch (e) {
    console.error(e);
  }
}

describe('lobsterserver-default-args', function() {
  const tmp = tmpdir() + '/lobster.txt';
  let c;
  beforeAll(async () => {
    return new Promise(function(resolve) {
      c = startServer(['--logs', path.dirname(__dirname) + '/e2e', '--e2e']);
      expect(c).not.toEqual(null);
      return setTimeout(resolve, 5000);
    });

    sinon.replace(window, 'fetch', function(req) {
      console.log(req.url);
      return fetch(req.url);
    });
  }, 10000);

  afterAll(() => {
    sinon.restore();
    if (c) {
      c.kill();
    }
    if (fs.existsSync(tmp)) {
      fs.unlink(tmp, 'w');
    }
  });

  e2e('fetch-ok', (done) => {
    lobster().then((resp) => {
      resp.text().then((body) => {
        expect(resp.status).toBe(200);
        expect(body).toHaveLength(51);
        done();
      });
    }).catch((e) => {
      done.fail(e);
    });
  }, 10000);

  e2e('fetch-notexist', (done) => {
    lobster(undefined, '___notexist.log').then((resp) => {
      resp.text().then((body) => {
        expect(resp.status).toBe(404);
        expect(body).toBe('log not found');
        done();
      });
    }).catch((e) => done.fail(e));
  }, 10000);

  e2e('fetch-insecure-path', (done) => {
    fs.closeSync(fs.openSync(tmp, 'w'));
    lobster(undefined, '../../../../../../../../../../../../../' + tmp).then((resp) => {
      resp.text().then((body) => {
        expect(resp.status).toBe(404);
        expect(body).toBe('log not found');
        done();
      });
    }).catch((e) => done.fail(e));
  }, 10000);

  //e2e('evergreen-test', (done) => {
  //  return api.fetchEvergreen({
  //    type: 'evergreen-test',
  //    id: 'testid1234'
  //  }).then((resp) => {
  //    expect(resp.status).toBe(200);
  //    return resp.text().then((log) => {
  //      expect(log).toMatchSnapshot();
  //      done();
  //    });
  //  });
  //}, 10000);

  //e2e('evergreen-task', (done) => {
  //  return api.fetchEvergreen({
  //    type: 'evergreen-task',
  //    id: 'testid1234',
  //    execution: 1234
  //  }).then((resp) => {
  //    expect(resp.status).toBe(200);
  //    return resp.text().then((log) => {
  //      expect(log).toMatchSnapshot();
  //      done();
  //    });
  //  });
  //}, 10000);

  //e2e('logkeeper', (done) => {
  //  return api.fetchLogkeeper('build1234', 'test1234')
  //    .then((resp) => {
  //      expect(resp.status).toBe(200);
  //      return resp.text().then((log) => {
  //        expect(log).toMatchSnapshot();
  //        done();
  //      });
  //    });
  //}, 10000);

});

describe('lobsterserver-other', function() {
  let c;
  afterEach(() => {
    if (c) {
      c.kill();
    }
  });

  e2e('fetch-logs-disabled', (done) => {
    c = startServer([]);
    setTimeout(function() {
      lobster(undefined, 'simple.log').then((resp) => {
        resp.text().then((body) => {
          expect(resp.status).toBe(400);
          expect(body).toBe('');
          done();
        }).catch((e) => done.fail(e));
      }).catch((e) => done.fail(e));
    }, 5000);
  }, 10000);

  e2e('fetch-port', (done) => {
    c = startServer(['--port', '8999', '--logs', path.dirname(__dirname) + '/e2e']);
    setTimeout(function() {
      lobster(8999, 'simple.log').then((resp) => {
        resp.text().then((_body) => {
          expect(resp.status).toBe(200);
          done();
        }).catch((e) => done.fail(e));
      }).catch((e) => done.fail(e));
    }, 5000);
  }, 10000);
});
