const express = require('express');
const morgan = require('morgan');
const path = require('path');
const needle = require('needle');
const bodyParser = require('body-parser');
const hash = require('string-hash');

const appE2E = require('./appE2E');
const dummyCache = require('./dummy_cache');
const localCache = require('./local_cache');

const { cors, isValidURL } = require('./util');

function makeApp(logsPath, cache, isE2E) {
  const logsDir = logsPath === undefined ? undefined : path.resolve(logsPath);
  if (logsDir) {
    console.log('Serving local logs from directory: ' + logsDir);
  }
  const myCache = cache === undefined ? dummyCache() : localCache(cache);
  const app = express();

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

  if (isE2E) {
    console.log('e2e routes are active');
    appE2E(app);
  }


  app.use('/api/log', cors);
  app.options('/api/log', function(req, res, _next) {
    res.send();
  });

  app.post('/api/log', function(req, res, _next) {
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

      res.sendFile(reqPath, function(e) {
        if (e) {
          if (e && e.code === 'ENOENT') {
            res.status(404).send('log not found').end();
          } else {
            res.status(500).send(e).end();
          }
        }
      });
    } else {
      console.log('Must provide the --logs argument to handle local files');
      res.status(400).end();
    }
  });

  // Always return the main index.html, so react-router render the route in the client
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'build', 'index.html'));
  });

  return app;
}

const makeListener = (options, callback) => {
  const listener = makeApp(options.logs, options.cache, options.e2e).listen(options.port, options.bind_address, () => {
    if (callback != null) {
      return callback(listener);
    }
  });
};

module.exports = {
  makeApp: makeApp,
  makeListener: makeListener
};
