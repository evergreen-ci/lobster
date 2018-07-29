const app = require('./server/app');
const child = require('child_process');
const path = require('path');
const yargs = require('yargs');

const argv = yargs
  .usage('Usage: $0 [browser]')
  .help('help')
  .alias('help', 'h')
  .option('headless', {
    description: 'forcefully enable headless mode when CI === true',
    default: false,
    type: 'boolean'
  })
  .option('no_headless', {
    description: 'forcefully disable headless mode when CI != true ',
    default: false,
    type: 'boolean'
  })
  .option('no_build', {
    description: 'do not run `npm run build` before running tests',
    default: false,
    type: 'boolean'
  })
  .option('no_server', {
    default: false,
    type: 'boolean'
  })
  .option('port', {
    default: 9000,
    type: 'number'
  })
  .option('browser', {
    default: 'chrome',
    type: 'string'
  })
  .nargs('browser', 1)
  .option('t', {
    default: 'e2e.*',
    type: 'string'
  })
  .nargs('t', 1)
  .argv;

let listener;
process.on('SIGINT', () => {
  if (listener) {
    listener.close();
  }
  process.exit(130);
});

function test() {
  const e2eProcess = child.spawn('npm', ['run', 'test', '--', '-t', argv.t, ...argv._], {
    'env': {
      ...process.env,
      ...this
    },
    stdio: 'inherit'
  });

  e2eProcess.on('close', function(code2) {
    if (listener) {
      listener.close();
    }
    process.exit(code2);
  });
}

function build(env, callback) {
  const buildProcess = child.spawn('npm', ['run', 'build'], {
    'env': {
      ...process.env,
      ...env
    },
    stdio: 'inherit'
  });

  buildProcess.on('close', callback);
}

function run(l) {
  listener = l;
  const port = listener ? listener.address().port : argv.port;
  console.log(`Testing lobster server on port: ${port}`);
  const uiBase = `http://localhost:${port}`;

  const headless = process.env.CI === 'true' ? !argv.headless : !argv.no_headless;

  const env = {
    LOBSTER_E2E_SERVER_PORT: port,
    LOBSTER_E2E_BROWSER: argv.browser,
    LOBSTER_E2E_HEADLESS: headless,
    REACT_APP_LOGKEEPER_BASE: `${uiBase}/logkeeper`,
    REACT_APP_EVERGREEN_BASE: `${uiBase}/evergreen`
  };

  if (argv.no_build) {
    return test.call(env);
  }
  return build(env, test.bind(env));
}

if (argv.no_server === true) {
  run(null);
} else {
  const e2eLogPath = path.join(path.resolve('.'), '/e2e');
  app.makeListener({
    bind_address: '127.0.0.1',
    port: 0,
    logs: e2eLogPath,
    e2e: true
  }, run);
}
