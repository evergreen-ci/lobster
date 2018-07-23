const app = require('./app');
const path = require('path');
const fs = require('fs');
const yargs = require('yargs');

const PORT = process.env.PORT || 9000;

const distPath = path.resolve(__dirname, '..', 'build', 'index.html');
if (!fs.existsSync(distPath)) {
  console.error('\nERROR: Expected ' + distPath + ' to exist, but it does not. Have you run `npm run build`?');
  process.exit();
}

const addr = yargs.argv.bind_address || '127.0.0.1';

app.listen(PORT, addr, () => {
  console.log('App listening on ' + addr + ':' + PORT + '!');
});
