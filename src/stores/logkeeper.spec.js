// @flow
import assert from 'assert';
import { LobsterStore } from '../stores';

test('store-line-gitref', function() {
  const data = [
    '[js_test:apply_batch_only_goes_forward] 2017-08-02T00:40:40.067+0000 ReplSetTest Starting....',
    '[js_test:apply_batch_only_goes_forward] 2017-08-02T00:40:40.068+0000 Resetting db path \'/data/db/job7/mongorunner/apply_batch_only_goes_forward-0\'',
    '[js_test:apply_batch_only_goes_forward] 2017-08-02T00:40:40.077+0000 2017-08-02T00:40:40.075+0000 I -        [thread1] {githash: "src/mongo/shell/shell_utils_launcher.cpp#L447"} shell: started program (sh21021):  /data/mci/52916ab68aecf0095281c3eeed069d42/src/mongod --oplogSize 40 --port 21760 --noprealloc --smallfiles --replSet apply_batch_only_goes_forward --dbpath /data/db/job7/mongorunner/apply_batch_only_goes_forward-0 --setParameter writePeriodicNoops=false --setParameter numInitialSyncAttempts=1 --setParameter numInitialSyncConnectAttempts=60 --bind_ip 0.0.0.0 --nopreallocj --setParameter enableTestCommands=1 --storageEngine mmapv1 --setParameter orphanCleanupDelaySecs=0 --setParameter logComponentVerbosity={"tracking":0,"replication":{"heartbeats":2}}'
  ];

  LobsterStore.processServerResponse({ data: data.join('\n') });

  const state = LobsterStore.state;
  assert.equal(state.lines.length, 3);
  assert.equal(null, state.lines[0].gitRef);
  assert.equal(null, state.lines[1].gitRef);
  assert.equal(state.lines[2].lineNumber, 2);
  assert.equal('https://github.com/mongodb/mongo/blob/master/src/mongo/shell/shell_utils_launcher.cpp#L447',
    state.lines[2].gitRef);
});

test('store-getFullGitRef', function() {
  assert.equal(null, LobsterStore.getFullGitRef(undefined, 'abcd'));
  assert.equal(null, LobsterStore.getFullGitRef(null, 'abcd'));
  assert.equal(null, LobsterStore.getFullGitRef('', 'abcd'));

  assert.equal('https://github.com/mongodb/mongo/blob/abcd/fileLine', LobsterStore.getFullGitRef('fileLine', 'abcd'));
});

test('store-getGitVersion', function() {
  assert.equal(null, LobsterStore.getFullGitRef(undefined, 'abcd'));
  assert.equal(null, LobsterStore.getFullGitRef(null, 'abcd'));
  assert.equal(null, LobsterStore.getFullGitRef('', 'abcd'));

  assert.equal('https://github.com/mongodb/mongo/blob/abcd/fileLine', LobsterStore.getFullGitRef('fileLine', 'abcd'));
});

test('store-generateLogkeeperUrl', function() {
  assert.equal('', LobsterStore.generateLogkeeperUrl(undefined, undefined));
  assert.equal('', LobsterStore.generateLogkeeperUrl(null, undefined));
  assert.equal('', LobsterStore.generateLogkeeperUrl('', undefined));
  assert.equal('http://domain.invalid/build/build1234/all?raw=1', LobsterStore.generateLogkeeperUrl('build1234', undefined));
  assert.equal('http://domain.invalid/build/build1234/all?raw=1', LobsterStore.generateLogkeeperUrl('build1234', null));
  assert.equal('http://domain.invalid/build/build1234/all?raw=1', LobsterStore.generateLogkeeperUrl('build1234', ''));
  assert.equal('http://domain.invalid/build/build1234/test/test1234?raw=1', LobsterStore.generateLogkeeperUrl('build1234', 'test1234'));
});
