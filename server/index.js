const app = require('./app');
const path = require('path');
const fs = require('fs');
const yargs = require('yargs');

const PORT = (() => {
  const p = parseInt(process.env.PORT, 10) || parseInt(yargs.argv.port, 10);
  if (p === 0) {
    return 0;
  }
  return p || 9000;
})();

const distPath = path.resolve(__dirname, '..', 'build', 'index.html');

if (!fs.existsSync(distPath)) {
  console.error('\nERROR: Expected ' + distPath + ' to exist, but it does not. Have you run `npm run build`?');
  process.exit();
}

app.makeListener(yargs.argv.bind_address, PORT, yargs.argv.logs, yargs.argv.cache, (listener) => {
    const address = `${listener.address().address}:${listener.address().port}`;
    console.log('App listening on ' + address + '!');
});
