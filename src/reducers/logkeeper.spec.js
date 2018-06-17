// @flow
import assert from 'assert';
import { logkeeperDataResponse } from './logkeeper';
import { logkeeperDataSuccess } from '../actions';

test('store-line-gitref', function() {
  const data = [
    '[js_test:apply_batch_only_goes_forward] 2017-08-02T00:40:40.067+0000 ReplSetTest Starting....',
    '[js_test:apply_batch_only_goes_forward] 2017-08-02T00:40:40.068+0000 Resetting db path \'/data/db/job7/mongorunner/apply_batch_only_goes_forward-0\'',
    '[js_test:apply_batch_only_goes_forward] 2017-08-02T00:40:40.077+0000 2017-08-02T00:40:40.075+0000 I -        [thread1] {githash: "src/mongo/shell/shell_utils_launcher.cpp#L447"} shell: started program (sh21021):  /data/mci/52916ab68aecf0095281c3eeed069d42/src/mongod --oplogSize 40 --port 21760 --noprealloc --smallfiles --replSet apply_batch_only_goes_forward --dbpath /data/db/job7/mongorunner/apply_batch_only_goes_forward-0 --setParameter writePeriodicNoops=false --setParameter numInitialSyncAttempts=1 --setParameter numInitialSyncConnectAttempts=60 --bind_ip 0.0.0.0 --nopreallocj --setParameter enableTestCommands=1 --storageEngine mmapv1 --setParameter orphanCleanupDelaySecs=0 --setParameter logComponentVerbosity={"tracking":0,"replication":{"heartbeats":2}}',
    '[js_test:apply_batch_only_goes_forward:primary] blah blah blah',
    ''
  ];

  const state = logkeeperDataResponse(undefined, logkeeperDataSuccess(data.join('\n')));

  assert.deepEqual(state.lines.length, 5);
  assert.deepEqual(state.lines[0].gitRef, null);
  assert.deepEqual(state.lines[1].gitRef, null);
  assert.deepEqual(state.lines[2].lineNumber, 2);
  assert.deepEqual('https://github.com/mongodb/mongo/blob/master/src/mongo/shell/shell_utils_launcher.cpp#L447',
    state.lines[2].gitRef);
  assert.deepEqual(state.colorMap[':primary]'], '#5aae61');
});
