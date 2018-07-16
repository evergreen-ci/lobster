// @flow

import assert from 'assert';
import { logkeeperDataResponse } from './logkeeper';
import { logkeeperDataSuccess, logkeeperDataError } from '../actions';

test('store-line-gitref', function() {
  const data = [
    '[js_test:apply_batch_only_goes_forward] 2017-08-02T00:40:40.067+0000 ReplSetTest Starting....',
    '[js_test:apply_batch_only_goes_forward] 2017-08-02T00:40:40.068+0000 Resetting db path \'/data/db/job7/mongorunner/apply_batch_only_goes_forward-0\'',
    '[js_test:apply_batch_only_goes_forward] 2017-08-02T00:40:40.077+0000 2017-08-02T00:40:40.075+0000 I -        [thread1] {githash: "src/mongo/shell/shell_utils_launcher.cpp#L447"} shell: started program (sh21021):  /data/mci/52916ab68aecf0095281c3eeed069d42/src/mongod --oplogSize 40 --port 21760 --noprealloc --smallfiles --replSet apply_batch_only_goes_forward --dbpath /data/db/job7/mongorunner/apply_batch_only_goes_forward-0 --setParameter writePeriodicNoops=false --setParameter numInitialSyncAttempts=1 --setParameter numInitialSyncConnectAttempts=60 --bind_ip 0.0.0.0 --nopreallocj --setParameter enableTestCommands=1 --storageEngine mmapv1 --setParameter orphanCleanupDelaySecs=0 --setParameter logComponentVerbosity={"tracking":0,"replication":{"heartbeats":2}}',
    '[js_test:apply_batch_only_goes_forward:primary] blah blah blah',
    '[js_test:apply_batch_only_goes_forward:node0] blah blah blah',
    '[js_test:apply_batch_only_goes_forward:node1] blah blah blah',
    '[js_test:apply_batch_only_goes_forward:node2] blah blah blah',
    '[js_test:apply_batch_only_goes_forward:node3] blah blah blah',
    '[js_test:apply_batch_only_goes_forward:node4] blah blah blah',
    '[js_test:apply_batch_only_goes_forward:node5] blah blah blah',
    '[js_test:apply_batch_only_goes_forward:node6] blah blah blah',
    '[js_test:apply_batch_only_goes_forward:node7] blah blah blah',
    '[js_test:apply_batch_only_goes_forward:node8] blah blah blah',
    '[js_test:apply_batch_only_goes_forward:node9] blah blah blah',
    '[js_test:apply_batch_only_goes_forward:node10] blah blah blah',
    '[js_test:apply_batch_only_goes_forward:node11] blah blah blah',
    '[js_test:apply_batch_only_goes_forward:node12] blah blah blah',
    '[js_test:apply_batch_only_goes_forward:node13] blah blah blah',
    '[js_test:apply_batch_only_goes_forward:node14] blah blah blah',
    '[js_test:apply_batch_only_goes_forward:node15] blah blah blah',
    '[js_test:apply_batch_only_goes_forward:node16] blah blah blah',
    '[js_test:apply_batch_only_goes_forward:node17] blah blah blah',
    '[js_test:apply_batch_only_goes_forward:node18] blah blah blah',
    '[js_test:apply_batch_only_goes_forward:node19] blah blah blah',
    '' // Lobster log files are interpreted to have an extra newline
  ];

  const state = logkeeperDataResponse({lines: [], colorMap: {}}, logkeeperDataSuccess(data.join('\n')));

  assert.deepEqual(state.lines.length, 25);
  assert.deepEqual(state.lines[0].gitRef, null);
  assert.deepEqual(state.lines[1].gitRef, null);
  assert.deepEqual(state.lines[2].lineNumber, 2);
  assert.deepEqual('https://github.com/mongodb/mongo/blob/master/src/mongo/shell/shell_utils_launcher.cpp#L447',
    state.lines[2].gitRef);
  assert.deepEqual(state.colorMap[':primary]'], '#5aae61');
  Object.keys(state.colorMap).forEach((value) => assert.notEqual(value, undefined));
});

test('logkeeperDataResponse-error', function() {
  const action = logkeeperDataError('error');
  const state = logkeeperDataResponse(undefined, action);
  assert.deepEqual(state.lines.length, 0);
  assert.deepEqual(state.colorMap.size, 0);
});

test('logkeeperDataResponse-chunked', function() {
  let data = [
    '[test:node0] line0',
    '[test:node0] line1'
  ];
  let state = {lines: [], colorMap: {}};
  state = logkeeperDataResponse(state, logkeeperDataSuccess(data.join('\n')));
  assert.deepEqual(state.lines.length, 2);
  assert.deepEqual(Object.keys(state.colorMap).length, 1);

  data = [
    '[test:node1] line2',
    '[test:node2] line3'
  ];
  state = logkeeperDataResponse(state, logkeeperDataSuccess(data.join('\n')));

  assert.deepEqual(state.lines.length, 4);
  assert.deepEqual(Object.keys(state.colorMap).length, 3);

  const colors = [];
  Object.keys(state.colorMap).map((key) => {
    if (!(colors.hasOwnProperty(key))) {
      colors.push(state.colorMap[key]);
    }
  });
  assert.deepEqual(colors.length, 3);
});
