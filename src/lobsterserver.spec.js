/* global process:{} */

import fs from 'fs';
import { tmpdir } from 'os';
import { spawn, spawnSync } from 'child_process';
import path from 'path';
import fetch from 'node-fetch';
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

describe('lobsterserver', function() {
  beforeAll(() => {
    // XXX: there is a jest bug in the old version that we're using, so
    // this check is required to prevent npm build from being run
    if (process.env.CI === 'true') {
      spawnSync('npm', ['run', 'build'], {
        'stdio': 'inherit'
      });
    }
  });

  beforeEach(() => {
    window.fetch = function(req) {
      console.log(req.url);
      return fetch(req.url);
    };
  });

  let c;
  afterEach(() => {
    if (fs.existsSync('/tmp/lobster.txt')) {
      fs.unlinkSync('/tmp/lobster.txt');
    }
    if (c) {
      c.kill('SIGINT');
      c = undefined;
    }
  });

  e2e('fetch-ok', (done) => {
    c = startServer(['--logs', path.dirname(__dirname) + '/e2e']);
    setTimeout(function() {
      lobster().then((resp) => {
        resp.text().then((body) => {
          expect(resp.status).toBe(200);
          expect(body).toHaveLength(51);
          done();
        });
      }).catch((e) => {
        done.fail(e);
      });
    }, 5000);
  }, 10000);

  e2e('fetch-notexist', (done) => {
    c = startServer(['--logs', path.dirname(__dirname) + '/e2e']);
    setTimeout(function() {
      lobster(undefined, '___notexist.log').then((resp) => {
        resp.text().then((body) => {
          expect(resp.status).toBe(404);
          expect(body).toBe('log not found');
          done();
        });
      }).catch((e) => done.fail(e));
    }, 5000);
  }, 10000);

  e2e('fetch-insecure-path', (done) => {
    fs.closeSync(fs.openSync(tmpdir() + '/lobster.txt', 'w'));
    c = startServer(['--logs', path.dirname(__dirname) + '/e2e']);
    setTimeout(function() {
      lobster(undefined, '___notexist.log').then((resp) => {
        resp.text().then((body) => {
          expect(resp.status).toBe(404);
          expect(body).toBe('log not found');
          done();
        });
      }).catch((e) => done.fail(e));
    }, 5000);
  }, 10000);

  e2e('fetch-logs-disabled', (done) => {
    fs.closeSync(fs.openSync(tmpdir() + '/lobster.txt', 'w'));
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
    fs.closeSync(fs.openSync(tmpdir() + '/lobster.txt', 'w'));
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

  e2e('evergreen-test', (done) => {
    fs.closeSync(fs.openSync(tmpdir() + '/lobster.txt', 'w'));
    c = startServer(['--e2e']);
    setTimeout(function() {
      return api.fetchEvergreen({
        type: 'evergreen-test',
        id: 'testid1234'
      }).then((resp) => {
        expect(resp.status).toBe(200);
        return resp.text().then((log) => {
          expect(log).toMatchSnapshot();
          done();
        });
      });
    }, 5000);
  }, 10000);

  e2e('evergreen-task', (done) => {
    fs.closeSync(fs.openSync(tmpdir() + '/lobster.txt', 'w'));
    c = startServer(['--e2e']);
    setTimeout(function() {
      return api.fetchEvergreen({
        type: 'evergreen-task',
        id: 'testid1234',
        execution: 1234
      }).then((resp) => {
        expect(resp.status).toBe(200);
        return resp.text().then((log) => {
          expect(log).toMatchSnapshot();
          done();
        });
      });
    }, 5000);
  }, 10000);

  e2e('logkeeper', (done) => {
    fs.closeSync(fs.openSync(tmpdir() + '/lobster.txt', 'w'));
    c = startServer(['--e2e']);
    setTimeout(function() {
      return api.fetchLogkeeper('build1234', 'test1234')
        .then((resp) => {
          expect(resp.status).toBe(200);
          return resp.text().then((log) => {
            expect(log).toMatchSnapshot();
            done();
          });
        });
    }, 5000);
  }, 10000);
});
