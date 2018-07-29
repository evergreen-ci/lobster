const app = require('./server/app');
const child = require('child_process');
const path = require('path');
const yargs = require('yargs');

const e2eLogPath = path.join(path.resolve('.'), '/e2e');

const argv = yargs
  .option('no_server', {
    default: false,
    type: 'boolean'
  })
  .option('port', {
    default: 9000,
    type: 'number'
  })
  .option('t', {
    default: 'e2e.*',
    type: 'string'
  })
  .argv;

function run(listener) {
  const port = !listener ? argv.port : listener.address().port;

  console.log(`Spawning e2e process with lobster server on port: ${port}`);
  process.on('SIGINT', () => {
    if (listener) {
      listener.close();
    }
    process.exit(130);
  });

  const uiBase = `http://localhost:${port}`;

  const build = child.spawn('npm', ['run', 'build'], {
    'env': {
      ...process.env,
      LOBSTER_E2E_SERVER_PORT: port,
      LOBSTER_E2E_BROWSER: argv._ || 'chrome',
      REACT_APP_LOGKEEPER_BASE: `${uiBase}/logkeeper`,
      REACT_APP_EVERGREEN_BASE: `${uiBase}/evergreen`
    },
    stdio: 'inherit'
  });

  build.on('close', (code) => {
    if (code !== 0) {
      if (listener) {
        listener.close();
      }
      process.exit(code);
    }
    const e2e = child.spawn('npm', ['run', 'test', '--', '-t', argv.t], {
      'env': {
        ...process.env,
        LOBSTER_E2E_SERVER_PORT: port,
        LOBSTER_E2E_BROWSER: argv._ || 'chrome'
      },
      stdio: 'inherit'
    });

    e2e.on('close', function(code2) {
      if (listener) {
        listener.close();
      }
      process.exit(code2);
    });
  });
}

if (argv.no_server === true) {
  run(null);
} else {
  app.makeListener(undefined, 0, e2eLogPath, undefined, run, true);
}
