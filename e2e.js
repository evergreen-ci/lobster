const app = require('./server/app');
const child = require('child_process');
const path = require('path');
const yargs = require('yargs');

const argv = yargs
  .usage('Usage: $0 [browser]')
  .help('help')
  .alias('help', 'h')
  .option('headless', {
    description: 'forcefully enable headless mode',
    default: false,
    type: 'boolean'
  })
  .option('no_headless', {
    description: 'forcefully disable headless mode',
    default: false,
    type: 'boolean',
    hidden: true
  })
  .option('no_build', {
    description: 'do not run `npm run build` before running tests',
    default: false,
    type: 'boolean'
  })
  .option('no_server', {
    description: 'do not run `node server` before running tests',
    default: false,
    type: 'boolean'
  })
  .option('port', {
    description: 'specify port number to bind e2e server to',
    default: 9000,
    type: 'number'
  })
  .implies('no_server', 'port')
  .option('browser', {
    description: 'selenium compatible browser string',
    default: 'chrome',
    type: 'string'
  })
  .nargs('browser', 1)
  .option('t', {
    description: 'jest test regular expression',
    default: 'e2e.*',
    type: 'string'
  })
  .nargs('t', 1)
  .check(function(args) {
    if (args.headless === true && args.no_headless === true) {
      throw new TypeError('--headless and --no_headless are mutually exclusive');
    }

    if (process.env.CI === 'true') {
      if (args.no_headless) {
        args.headless = false;
      } else {
        args.headless = true;
      }
    } else {
      if (args.headless) {
        args.headless = true;
      } else {
        args.headless = false;
      }
    }

    return true;
  })
  .argv;

console.log(argv);

let listener;
let processes = [];
const cleanup = () => {
  if (listener) {
    listener.close();
  }
  processes.forEach((p) => {
    p.kill('SIGINT');
  });
  processes = [];
};
process.on('SIGINT', () => {
  cleanup();
  process.exit(130);
});
process.on('exit', () => {
  cleanup();
});

function test() {
  const e2eProcess = child.spawn('npm', ['run', 'test', '--', '-t', argv.t, ...argv._], {
    'env': {
      ...process.env,
      ...this
    },
    stdio: 'inherit'
  });
  processes.push(e2eProcess);

  e2eProcess.on('close', process.exit);
}

function build(env, callback) {
  const buildProcess = child.spawn('npm', ['run', 'build'], {
    'env': {
      ...process.env,
      ...env
    },
    stdio: 'inherit'
  });
  processes.push(buildProcess);

  buildProcess.on('close', callback);
}

function run(l) {
  listener = l;
  const port = listener ? listener.address().port : argv.port;
  console.log(`Testing lobster server on port: ${port}`);
  const uiBase = `http://localhost:${port}`;

  const env = {
    LOBSTER_E2E_SERVER_PORT: port,
    LOBSTER_E2E_BROWSER: argv.browser,
    LOBSTER_E2E_HEADLESS: argv.headless,
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
