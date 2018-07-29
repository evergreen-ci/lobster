const app = require('./app');
const path = require('path');
const fs = require('fs');
const yargs = require('yargs');

const envPort = parseInt(process.env.PORT, 10);
const pathResolve = (p) => {
  if (p === undefined) {
    return p;
  }
  return path.resolve(p);
};

if (require.main === module) {
  const argv = yargs
    .help('help')
    .alias('help', 'h')
    .option('bind_address', {
      description: 'address to bind to',
      default: '127.0.0.1',
      type: 'string'
    })
    .option('port', {
      description: 'port number to bind server to',
      default: envPort === 0 ? 0 : (envPort || 9000),
      type: 'number'
    })
    .option('cache', {
      description: 'directory to cache files into. All directory content will be deleted on the server start up!',
      default: undefined,
      type: 'string'
    })
    .option('logs', {
      description: 'path to log files that will be available to server',
      default: undefined,
      type: 'string'
    })
    .option('e2e', {
      describe: 'enable special routes for e2e testing',
      hidden: true,
      default: false,
      type: 'boolean'
    })
    .coerce(['cache', 'logs'], pathResolve)
    .argv;

  const distPath = path.resolve(__dirname, '..', 'build', 'index.html');

  if (!fs.existsSync(distPath)) {
    console.error('\nERROR: Expected ' + distPath + ' to exist, but it does not. Have you run `npm run build`?');
    process.exit(1);
  }

  app.makeListener(argv, (listener) => {
    const address = `${listener.address().address}:${listener.address().port}`;
    console.log('App listening on ' + address + '!');
  });
} else {
  module.exports = {};
}
