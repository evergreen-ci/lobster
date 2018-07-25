const express = require('express');
const morgan = require('morgan');
const path = require('path');
const needle = require('needle');
const bodyParser = require('body-parser');
const hash = require('string-hash');

const app = express();

console.log('Starting server to support lobster log viewer.\nOptions:\n  --cache   Cache files after download in the provided directory. Note! All directory content will be deleted on the server start up! [optional]\n  --logs  An absolute path to log files that will be available to server [optional]\n  --bind_address  Specify the address lobster should bind to. Defaults to 127.0.0.1 [optional]');

function isValidURL(str) {
  const expression = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
  const regex = new RegExp(expression);

  return str.match(regex);
}

let myCache = require('./dummy_cache')();
let logsDir = undefined;

// Setup logger
app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms'));

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// Serve static assets
app.use(express.static(path.resolve(__dirname, '..', 'build')));

app.use(function(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }
  res.status(500);
  res.render('error', { error: err });
});

// Always return the main index.html, so react-router render the route in the client
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'build', 'index.html'));
});

function cors(req, res) {
  if (req.get('Origin').length !== 0) {
    res.set({
      'Access-Control-Allow-Origin': req.get('Origin'),
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS'
    });
  }
}

app.options('/api/log', function(req, res, _next) {
  cors(req, res);
  res.send();
});

app.post('/api/log', function(req, res, _next) {
  cors(req, res);

  const logUrl = req.body.url;
  const filter = req.body.filter;
  if (logUrl === undefined) {
    console.log('url is undefined');
    res.status(403).send('url cannot be undefined');
    return;
  }
  console.log('url = ' + logUrl);

  if (filter) {
    console.log('filter = ' + filter);
  } else {
    console.log('filter is not set');
  }

  if (isValidURL(logUrl)) {
    const fileName = hash(logUrl).toString();

    myCache.get(fileName)
      .then(data => {
        console.log('got from cache: ' + fileName);
        res.send(data);
      })
      .catch(_ => {
        console.log(fileName + ' is not in the cache');

        const stream = needle.get(logUrl);
        let result = '';

        stream.on('readable', function() {
          for (let data = this.read(); data; data = this.read()) {
            result += data;
          }
        });

        stream.on('done', function(err) {
          if (!err) {
            console.log('done');
            myCache.put(fileName, result)
              .then(data => res.send(data));
          } else {
            console.log('Error: ' + err);
          }
        });
      });
  } else if (logsDir) {
    // validate that the file is in logsDir
    const reqPath = path.resolve(logsDir, logUrl);
    if (!reqPath.startsWith(logsDir)) {
      // since it's a security issue, we pretend it's not there
      console.log(reqPath + ' not in log directory base (' + logsDir + ')');
      res.status(404).send('log not found');
      return;
    }

    res.sendFile(reqPath);
  } else {
    console.log('Must provide the --logs argument to handle local files');
  }
});

const makeListener = (addr = '127.0.0.1', port = 9000, logsDir, cache, callback) => {
  if (cache != null) {
    myCache = require('./local_cache')(cache);
  }
  if (logsDir != null) {
    const absPath = path.resolve(logsDir);
    console.log('Serving local logs from directory: ' + absPath);
  }

  const listener = app.listen(port, addr, () => {
    if (callback != null) {
      callback(listener);
    }
  });
}

module.exports = {
  app: app,
  makeListener: makeListener
};
