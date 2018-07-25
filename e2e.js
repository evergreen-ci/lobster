const app = require('./server/app');
const child = require('child_process');
const path = require('path');

const e2eLogPath = path.resolve('.') + '/e2e';

app.makeListener(undefined, 9000, e2eLogPath, undefined, (listener) => {
  console.log(`Spawning e2e process with lobster server on port: ${listener.address().port}`);
  const e2e = child.spawnSync('npm', ['run', 'test', '--', '-t', 'e2e.*'], {
    'env': {
      ...process.env,
      CI: 'true',
      LOBSTER_E2E_SERVER_PORT: listener.address().port
    },
    stdio: 'inherit'
  });

  process.on('SIGINT', () => {
    console.log('Received SIGINT');
    listener.close();
    process.exit(130);
  });

  listener.close();
  process.exit(e2e);
});
