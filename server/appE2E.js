const { cors } = require('./util');

let enumerate = {};
function makeLines(req, res) {
  for (let i = 0; i < 10; ++i) {
    res.write('line ' + i);
    res.write('\n');
  }
  res.write('something else');
  res.write('\n');
  res.write('enumerate: ');

  const e = JSON.stringify(req.params);
  if (enumerate[e] === undefined) {
    enumerate = {};
    enumerate[e] = 0;
  }
  res.write(enumerate[e].toString());
  ++enumerate[e];
  res.write('\n');
}

function logkeeper(req, res) {
  if (req.query.raw !== '1') {
    return res.status(404).send();
  }

  res.status(200);
  res.write(req.params.build);
  res.write('\n');
  if (req.params.test) {
    res.write(req.params.test);
    res.write('\n');
  }
  makeLines(req, res);
}

function evergreen(req, res) {
  if (req.params.execution && (req.query.type === undefined || req.query.text !== 'true')) {
    return res.status(404).send();
  } else if (!req.params.execution && req.query.raw !== '1') {
    return res.status(404).send();
  }

  res.status(200);
  res.write(req.params.id);
  res.write('\n');
  if (req.params.execution) {
    res.write(req.params.execution);
    res.write('\n');
    res.write(req.query.type);
    res.write('\n');
  }
  makeLines(req, res);
}

function generatePerfTestLog(lines, res) {
  res.status(200);
  res.write('This log is a miniature performance stress test for lobster\n');
  res.write('Chrome has a limit of about 1.57 million lines\n');
  res.write('This file allows for testing that\n');
  for (let i = 0; i < lines; ++i) {
    res.write(`line ${i}\n`);
  }
  res.write('FIND_THIS_TOKEN');
}

const perfRegex = new RegExp(/perf-([0-9]+).special.log/);

function logMiddleware(req, res, next) {
  if (req.body.url) {
    const matches = perfRegex.exec(req.body.url);
    if (matches && matches.length === 2) {
      generatePerfTestLog(parseInt(matches[1], 10), res);
      return;
    }
  }
  next();
}

function e2e(app) {
  app.use('/api/log', cors, logMiddleware);
  app.options('/evergreen/task_log_raw/:id/:execution', cors);
  app.get('/evergreen/task_log_raw/:id/:execution', evergreen);
  app.options('/evergreen/test_log/:id', cors);
  app.get('/evergreen/test_log/:id', evergreen);

  app.options('/logkeeper/build/:build/all', cors);
  app.get('/logkeeper/build/:build/all', logkeeper);
  app.options('/logkeeper/build/:build/test/:test', cors);
  app.get('/logkeeper/build/:build/test/:test', logkeeper);
}

module.exports = e2e;
