const app = require('./server/app');
const child = require('child_process');
const path = require('path');

const e2eLogPath = path.join(path.resolve('.'), '/e2e');

app.makeListener(undefined, 0, e2eLogPath, undefined, (listener) => {
  console.log(`Spawning e2e process with lobster server on port: ${listener.address().port}`);
  process.on('SIGINT', () => {
    listener.close();
    process.exit(130);
  });

  const e2e = child.spawn('npm', ['run', 'test', '--', '-t', 'e2e.*'], {
    'env': {
      ...process.env,
      LOBSTER_E2E_SERVER_PORT: listener.address().port,
      LOBSTER_E2E_BROWSER: process.argv[2] || 'chrome',
      REACT_APP_LOGKEEPER_BASE: `http://localhost:${listener.address().port}/logkeeper`,
      REACT_APP_EVERGREEN_BASE: `http://localhost:${listener.address().port}/evergreen`
    },
    stdio: 'inherit'
  });

  e2e.on('close', function(code) {
    listener.close();
    process.exit(code);
  });
}, true);
