const app = require('./server/app');
const child = require('child_process');
const path = require('path');

const e2eLogPath = path.resolve('.') + '/e2e';

app.makeListener(undefined, 0, e2eLogPath, undefined, (listener) => {
  console.log(`Spawning e2e process with lobster server on port: ${listener.address().port}`);
  process.on('SIGINT', () => {
    listener.close();
    process.exit(130);
  });

  const e2e = child.spawn('npm', ['run', 'test', '--', '-t', 'e2e.*'], {
    'env': {
      ...process.env,
      LOBSTER_E2E_SERVER_PORT: listener.address().port
    },
    stdio: 'inherit'
  });

  e2e.on('close', function(code) {
    listener.close();
    process.exit(code);
  });
});
