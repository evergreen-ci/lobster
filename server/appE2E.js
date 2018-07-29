function cors(req, res) {
  if (!req) return;
  const origin = req.get('Origin');
  if (origin) {
    console.log(origin);
    res.set({
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, OPTIONS'
    });
  }
}

let enumerate = 0;
function makeLines(res) {
  for (let i = 0; i < 10; ++i) {
    res.write('line ' + i);
    res.write('\n');
  }
  res.write('something else');
  res.write('\n');
  res.write('enumerate: ');
  res.write(enumerate.toString());
  ++enumerate;
  res.write('\n');
  res.end();
}

function logkeeper(req, res) {
  cors(req, res);
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
  cors(req, res);
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
