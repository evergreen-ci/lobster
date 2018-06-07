const express = require('express');
const morgan = require('morgan');
const path = require('path');
const needle = require('needle');
const bodyParser = require('body-parser');
const hash = require('string-hash');

const app = express();

console.log('Starting server to support lobster log viewer.\nOptions:\n  --cache   Cache files after download in the provided directory. Note! All directory content will be deleted on the server start up! [optional]\n  --logs  An absolute path to log files that will be available to server [optional]');

function isValidURL(str) {
  var expression = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
  var regex = new RegExp(expression);

  return str.match(regex);
}

var myCache;
const cache = require('yargs').argv.cache;
if (cache) {
  myCache = require('./local_cache')(cache);
} else {
  myCache = require('./dummy_cache')();
}

const logsDir = require('yargs').argv.logs;

// Setup logger
app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms'));

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// Serve static assets
app.use(express.static(path.resolve(__dirname, '..', 'build/lobster')));

app.use(function(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }
  res.status(500);
  res.render('error', { error: err });
});

// Always return the main index.html, so react-router render the route in the client
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'build', 'lobster/index.html'));
});

app.post('/api/log', function(req, res, _next) {
  let logUrl = req.body.url;
  let filter = req.body.filter;
  if (logUrl === undefined) {
    console.log('url is undefined' );
    res.status(500).send('url cannot be undefined');
  }
  console.log('url = ' + logUrl);

  if (filter) {
    console.log('filter = ' + filter);
  } else {
    console.log('filter is not set');
  }

  if (isValidURL(logUrl)) {
    let fileName = hash(logUrl).toString();

    myCache.get(fileName)
      .then(data => {
        console.log('got from cache: ' + fileName);
        res.send(data);
      })
      .catch(_ => {
        console.log(fileName + ' is not in the cache');

        let stream = needle.get(logUrl);
        let result = '';

        stream.on('readable', function() {
          for (var data = this.read(); data; data = this.read()) {
            result += data;
          }
        });

        stream.on('done', function(err) {
          if (!err) {
            console.log('done');
            myCache.put(fileName, result)
              .then( data => res.send(data) );
          } else {
            console.log('Error: ' + err);
          }
        });
      });
  } else if (logsDir) {
    res.sendFile(path.resolve(logsDir, logUrl));
  } else {
    console.log('Must provide the --logs argument to handle local files');
  }
});

module.exports = app;
