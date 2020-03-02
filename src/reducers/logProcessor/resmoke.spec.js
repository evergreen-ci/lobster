// @flow

import resmoke from './resmoke';

describe('resmoke', function() {
  test('store-line-gitref', function() {
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

    const inState = {
      identity: {
        type: 'logkeeper',
        build: 'build1'
      },
      lines: [],
      colorMap: new Map(),
      isDone: false,
      events: []
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

  test('json logs are formatted correctly', () => {
    const data = () => [
      '[js_test:backup_restore_rolling] 2020-03-02T08:52:04.170+0000 d20521| {"t":{"$date":"2020-03-02T08:52:04.166+0000"},"s":"W", "c":"ASIO",    "id":22601,"ctx":"main","msg":"No TransportLayer configured during NetworkInterface startup"}',
      '[js_test:backup_restore_rolling] 2020-03-02T08:52:04.170+0000 d20520| {"t":{"$date":"2020-03-02T08:52:04.167+0000"},"s":"I", "c":"STORAGE", "id":22315,"ctx":"initandlisten","msg":"wiredtiger_open config: {config}","attr":{"config":"create,cache_size=1024M,cache_overflow=(file_max=0M),session_max=33000,eviction=(threads_min=4,threads_max=4),config_base=false,statistics=(fast),log=(enabled=true,archive=true,path=journal,compressor=snappy),file_manager=(close_idle_time=100000,close_scan_interval=10,close_handle_minimum=250),statistics_log=(wait=0),verbose=[recovery_progress,checkpoint_progress,compact_progress],"}}',
      '[js_test:backup_restore_rolling] 2020-03-02T08:52:04.173+0000 d20521| {"t":{"$date":"2020-03-02T08:52:04.173+0000"},"s":"I", "c":"STORAGE", "id":4615611,"ctx":"initandlisten","msg":"MongoDB starting","attr":{"pid":2161,"port":20521,"dbpath":"/data/db/job2/mongorunner/backupRestore/mongod-20521","architecture":"64-bit","host":"ip-10-122-59-32"}}',
      '[js_test:backup_restore_rolling] 2020-03-02T08:52:04.173+0000 d20521| {"t":{"$date":"2020-03-02T08:52:04.173+0000"},"s":"I", "c":"CONTROL", "id":23399,"ctx":"initandlisten","msg":"git version: {gitVersion}","attr":{"gitVersion":"4628f264e60fd69cd09388e6fca0d3dd1b82f14c"}}',
      '[js_test:backup_restore_rolling] 2020-03-02T08:52:04.173+0000 d20521| {"t":{"$date":"2020-03-02T08:52:04.173+0000"},"s":"I", "c":"CONTROL", "id":23400,"ctx":"initandlisten","msg":"{openSSLVersion_OpenSSL_version}","attr":{"openSSLVersion_OpenSSL_version":"OpenSSL version: OpenSSL 1.0.1e-fips 11 Feb 2013"}}',
      '[js_test:backup_restore_rolling] 2020-03-02T08:52:04.173+0000 d20521| {"t":{"$date":"2020-03-02T08:52:04.173+0000"},"s":"I", "c":"CONTROL", "id":23402,"ctx":"initandlisten","msg":"{ss_str}","attr":{"ss_str":"modules: enterprise "}}',
      '[js_test:backup_restore_rolling] 2020-03-02T08:52:04.174+0000 d20521| {"t":{"$date":"2020-03-02T08:52:04.173+0000"},"s":"I", "c":"CONTROL", "id":23404,"ctx":"initandlisten","msg":"    {std_get_0_envDataEntry}: {std_get_1_envDataEntry}","attr":{"std_get_0_envDataEntry":"target_arch","std_get_1_envDataEntry":"x86_64"}}',
      '[js_test:backup_restore_rolling] 2020-03-02T08:52:04.174+0000 d20521| {"t":{"$date":"2020-03-02T08:52:04.173+0000"},"s":"I", "c":"CONTROL", "id":51765,"ctx":"initandlisten","msg":"operating system: {name}, version: {version}","attr":{"name":"Red Hat Enterprise Linux Server release 6.2 (Santiago)","version":"Kernel 2.6.32-220.el6.x86_64"}}',
      '[js_test:backup_restore_rolling] 2020-03-02T08:52:04.792+0000 d20521| {"t":{"$date":"2020-03-02T08:52:04.792+0000"},"s":"D2","c":"RECOVERY","id":4615631,"ctx":"initandlisten","msg":"loadCatalog:"}',
      '[js_test:backup_restore_rolling] 2020-03-02T08:52:04.792+0000 d20521| {"t":{"$date":"2020-03-02T08:52:04.792+0000"},"s":"I", "c":"STORAGE", "id":22262,"ctx":"initandlisten","msg":"Timestamp monitor starting"}',
      ''
    ];

    const inState = {
      identity: {
        type: 'logkeeper',
        build: 'build1'
      },
      lines: [],
      colorMap: new Map(),
      isDone: false,
      events: []
    };
    const state = resmoke(inState, data().join('\n'));

    expect(state.lines).toHaveLength(11);
    expect(state.lines[0].text).toBe('[js_test:backup_restore_rolling] 2020-03-02T08:52:04.170+0000 d20521| 2020-03-02T08:52:04.166+0000 W  ASIO     22601   [main] \"No TransportLayer configured during NetworkInterface startup\"');
    expect(state.lines[1].text).toBe('[js_test:backup_restore_rolling] 2020-03-02T08:52:04.170+0000 d20520| 2020-03-02T08:52:04.167+0000 I  STORAGE  22315   [initandlisten] \"wiredtiger_open config: {config}\",\"attr\":{\"config\":\"create,cache_size=1024M,cache_overflow=(file_max=0M),session_max=33000,eviction=(threads_min=4,threads_max=4),config_base=false,statistics=(fast),log=(enabled=true,archive=true,path=journal,compressor=snappy),file_manager=(close_idle_time=100000,close_scan_interval=10,close_handle_minimum=250),statistics_log=(wait=0),verbose=[recovery_progress,checkpoint_progress,compact_progress],\"}');
    expect(state.lines[2].text).toBe('[js_test:backup_restore_rolling] 2020-03-02T08:52:04.173+0000 d20521| 2020-03-02T08:52:04.173+0000 I  STORAGE  4615611 [initandlisten] \"MongoDB starting\",\"attr\":{\"pid\":2161,\"port\":20521,\"dbpath\":\"/data/db/job2/mongorunner/backupRestore/mongod-20521\",\"architecture\":\"64-bit\",\"host\":\"ip-10-122-59-32\"}');
    expect(state.lines[3].text).toBe('[js_test:backup_restore_rolling] 2020-03-02T08:52:04.173+0000 d20521| 2020-03-02T08:52:04.173+0000 I  CONTROL  23399   [initandlisten] \"git version: {gitVersion}\",\"attr\":{\"gitVersion\":\"4628f264e60fd69cd09388e6fca0d3dd1b82f14c\"}');
    expect(state.lines[4].text).toBe('[js_test:backup_restore_rolling] 2020-03-02T08:52:04.173+0000 d20521| 2020-03-02T08:52:04.173+0000 I  CONTROL  23400   [initandlisten] \"{openSSLVersion_OpenSSL_version}\",\"attr\":{\"openSSLVersion_OpenSSL_version\":\"OpenSSL version: OpenSSL 1.0.1e-fips 11 Feb 2013\"}');
    expect(state.lines[5].text).toBe('[js_test:backup_restore_rolling] 2020-03-02T08:52:04.173+0000 d20521| 2020-03-02T08:52:04.173+0000 I  CONTROL  23402   [initandlisten] \"{ss_str}\",\"attr\":{\"ss_str\":\"modules: enterprise \"}');
    expect(state.lines[6].text).toBe('[js_test:backup_restore_rolling] 2020-03-02T08:52:04.174+0000 d20521| 2020-03-02T08:52:04.173+0000 I  CONTROL  23404   [initandlisten] \"    {std_get_0_envDataEntry}: {std_get_1_envDataEntry}\",\"attr\":{\"std_get_0_envDataEntry\":\"target_arch\",\"std_get_1_envDataEntry\":\"x86_64\"}');
    expect(state.lines[7].text).toBe('[js_test:backup_restore_rolling] 2020-03-02T08:52:04.174+0000 d20521| 2020-03-02T08:52:04.173+0000 I  CONTROL  51765   [initandlisten] \"operating system: {name}, version: {version}\",\"attr\":{\"name\":\"Red Hat Enterprise Linux Server release 6.2 (Santiago)\",\"version\":\"Kernel 2.6.32-220.el6.x86_64\"}');
    expect(state.lines[8].text).toBe('[js_test:backup_restore_rolling] 2020-03-02T08:52:04.792+0000 d20521| 2020-03-02T08:52:04.792+0000 D2 RECOVERY 4615631 [initandlisten] \"loadCatalog:\"');
    expect(state.lines[9].text).toBe('[js_test:backup_restore_rolling] 2020-03-02T08:52:04.792+0000 d20521| 2020-03-02T08:52:04.792+0000 I  STORAGE  22262   [initandlisten] \"Timestamp monitor starting\"');
    expect(state.lines[10].text).toBe('');
  })
});
