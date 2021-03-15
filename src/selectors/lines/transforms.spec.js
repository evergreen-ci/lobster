// @flow

import { parseLogLine } from "./transforms";

describe("log transformations", () => {
  test("json logs are formatted correctly", () => {
    const data = [
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
      '[js_test:backup_restore_rolling] 2020-03-02T08:52:04.792+0000 d20521 {"t":{"$date":"2020-03-02T08:52:04.792+0000"},"s":"I", "c":"STORAGE", "id":22262,"ctx":"initandlisten","msg":"Timestamp monitor starting"}',
      '[js_test:rollback_recovery_commit_transaction_before_stable_timestamp] 2020-05-04T00:19:23.903+0000 d21781| {"t":{"$date":"2020-05-04T00:19:23.887+00:00"},"s":"I",  "c":"REPL",     "id":51801,   "ctx":"ReplWriterWorker-2","msg":"Applied op","attr":{"command":{"lsid":{"id":{"$uuid":"da0c516c-95af-4e5d-8aaa-04fdf4244f18"},"uid":{"$binary":{"base64":"47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=","subType":"0"}}},"txnNumber":0,"op":"c","ns":"admin.$cmd","o":{"applyOps":[{"op":"u","ns":"test.commit_transaction_rollback_recovery_data_already_applied","ui":{"$uuid":"57bf46ec-b85b-4aba-8c84-5141cd6ccb3e"},"o":{"$v":1,"$set":{}}}]}},"durationMillis":201},"truncated":{"command":{"o":{"applyOps":{"0":{"o":{"$set":{"c":{"type":"string","size":7340036}}}}}}}},"size":{"command":7340469}}',
    ];

    const expected = [
      '[js_test:backup_restore_rolling] 2020-03-02T08:52:04.170+0000 d20521| 2020-03-02T08:52:04.166+0000 W  ASIO     22601   [main] "No TransportLayer configured during NetworkInterface startup"',
      '[js_test:backup_restore_rolling] 2020-03-02T08:52:04.170+0000 d20520| 2020-03-02T08:52:04.167+0000 I  STORAGE  22315   [initandlisten] "wiredtiger_open config: {config}","attr":{"config":"create,cache_size=1024M,cache_overflow=(file_max=0M),session_max=33000,eviction=(threads_min=4,threads_max=4),config_base=false,statistics=(fast),log=(enabled=true,archive=true,path=journal,compressor=snappy),file_manager=(close_idle_time=100000,close_scan_interval=10,close_handle_minimum=250),statistics_log=(wait=0),verbose=[recovery_progress,checkpoint_progress,compact_progress],"}',
      '[js_test:backup_restore_rolling] 2020-03-02T08:52:04.173+0000 d20521| 2020-03-02T08:52:04.173+0000 I  STORAGE  4615611 [initandlisten] "MongoDB starting","attr":{"pid":2161,"port":20521,"dbpath":"/data/db/job2/mongorunner/backupRestore/mongod-20521","architecture":"64-bit","host":"ip-10-122-59-32"}',
      '[js_test:backup_restore_rolling] 2020-03-02T08:52:04.173+0000 d20521| 2020-03-02T08:52:04.173+0000 I  CONTROL  23399   [initandlisten] "git version: {gitVersion}","attr":{"gitVersion":"4628f264e60fd69cd09388e6fca0d3dd1b82f14c"}',
      '[js_test:backup_restore_rolling] 2020-03-02T08:52:04.173+0000 d20521| 2020-03-02T08:52:04.173+0000 I  CONTROL  23400   [initandlisten] "{openSSLVersion_OpenSSL_version}","attr":{"openSSLVersion_OpenSSL_version":"OpenSSL version: OpenSSL 1.0.1e-fips 11 Feb 2013"}',
      '[js_test:backup_restore_rolling] 2020-03-02T08:52:04.173+0000 d20521| 2020-03-02T08:52:04.173+0000 I  CONTROL  23402   [initandlisten] "{ss_str}","attr":{"ss_str":"modules: enterprise "}',
      '[js_test:backup_restore_rolling] 2020-03-02T08:52:04.174+0000 d20521| 2020-03-02T08:52:04.173+0000 I  CONTROL  23404   [initandlisten] "    {std_get_0_envDataEntry}: {std_get_1_envDataEntry}","attr":{"std_get_0_envDataEntry":"target_arch","std_get_1_envDataEntry":"x86_64"}',
      '[js_test:backup_restore_rolling] 2020-03-02T08:52:04.174+0000 d20521| 2020-03-02T08:52:04.173+0000 I  CONTROL  51765   [initandlisten] "operating system: {name}, version: {version}","attr":{"name":"Red Hat Enterprise Linux Server release 6.2 (Santiago)","version":"Kernel 2.6.32-220.el6.x86_64"}',
      '[js_test:backup_restore_rolling] 2020-03-02T08:52:04.792+0000 d20521| 2020-03-02T08:52:04.792+0000 D2 RECOVERY 4615631 [initandlisten] "loadCatalog:"',
      '[js_test:backup_restore_rolling] 2020-03-02T08:52:04.792+0000 d20521| 2020-03-02T08:52:04.792+0000 I  STORAGE  22262   [initandlisten] "Timestamp monitor starting"',
      '[js_test:backup_restore_rolling] 2020-03-02T08:52:04.792+0000 d20521 | 2020-03-02T08:52:04.792+0000 I  STORAGE  22262   [initandlisten] "Timestamp monitor starting"',
      '[js_test:rollback_recovery_commit_transaction_before_stable_timestamp] 2020-05-04T00:19:23.903+0000 d21781| 2020-05-04T00:19:23.887+00:00 I  REPL     51801   [ReplWriterWorker-2] "Applied op","attr":{"command":{"lsid":{"id":{"$uuid":"da0c516c-95af-4e5d-8aaa-04fdf4244f18"},"uid":{"$binary":{"base64":"47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=","subType":"0"}}},"txnNumber":0,"op":"c","ns":"admin.$cmd","o":{"applyOps":[{"op":"u","ns":"test.commit_transaction_rollback_recovery_data_already_applied","ui":{"$uuid":"57bf46ec-b85b-4aba-8c84-5141cd6ccb3e"},"o":{"$v":1,"$set":{}}}]}},"durationMillis":201},"truncated":{"command":{"o":{"applyOps":{"0":{"o":{"$set":{"c":{"type":"string","size":7340036}}}}}}}},"size":{"command":7340469}',
    ];

    for (let i = 0; i < data.length; i++) {
      expect(parseLogLine(data[i])).toBe(expected[i]);
    }
  });
});
