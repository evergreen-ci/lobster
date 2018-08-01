// @flow

import resmoke from './resmoke';

const data = () => [
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

describe('resmoke', function() {
  test('store-line-gitref', function() {
    const inState = {
      identity: {
        type: 'logkeeper',
        build: 'build1'
      },
      lines: [],
      colorMap: new Map(),
      isDone: false
    };
    const state = resmoke(inState, data().join('\n'));

    expect(state.lines).toHaveLength(25);
    expect(state.lines[0].gitRef).toBe(undefined);
    expect(state.lines[1].gitRef).toBe(undefined);
    expect(state.lines[2].lineNumber).toBe(2);
    expect('https://github.com/mongodb/mongo/blob/master/src/mongo/shell/shell_utils_launcher.cpp#L447').toBe(state.lines[2].gitRef);
    expect(state.colorMap[':primary]']).toBe('#5aae61');
    Object.keys(state.colorMap).forEach((value) => expect(value).not.toBe(undefined));
    expect(state.identity).toBe(inState.identity);
  });
});
