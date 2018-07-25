import fs from 'fs';
import { tmpdir } from 'os';
import { spawn, spawnSync } from 'child_process';
import path from 'path';
import fetch from 'node-fetch';

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
    spawnSync('npm', ['run', 'build'], {
      'stdio': 'inherit',
    });
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

  test('fetch-ok', (done) => {
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

  test('fetch-notexist', (done) => {
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

  test('fetch-insecure-path', (done) => {
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

  test('fetch-logs-disabled', (done) => {
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

  test('fetch-port', (done) => {
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
});
