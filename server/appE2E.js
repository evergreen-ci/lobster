function makeLines(res) {
  for (let i = 0; i < 10; ++i) {
    res.write('line ' + i);
    res.write('\n');
  }
  res.write('something else');
  res.write('\n');
  res.end();
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
  makeLines(res);
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
  makeLines(res);
}

function e2e(app) {
  app.get('/evergreen/task_log_raw/:id/:execution', evergreen);
  app.get('/evergreen/test_log/:id', evergreen);

  app.get('/logkeeper/build/:build/all', logkeeper);
  app.get('/logkeeper/build/:build/test/:test', logkeeper);
}

module.exports = e2e;
