import assert from 'assert';
import {LobsterStore} from '../stores';

test('Store-Line-Colors', function() {
  const data = [
    '[ShardedClusterFixture:job0:configsvr:secondary0]',
    '[ShardedClusterFixture:job0:mongos]',
    '[ShardedClusterFixture:job0:configsvr:primary]',
    '[ShardedClusterFixture:job0:shard0:primary]',
    '[ShardedClusterFixture:job0:configsvr:secondary1]',
    '[ShardedClusterFixture:job0:shard0:primary]',
    '[ShardedClusterFixture:job0:mongos]',
    '[ShardedClusterFixture:job0:shard0:primary]',
    '[ShardedClusterFixture:job0:shard0:secondary1]'
  ];

  const response = {
    data: data.join('\n')
  };
  LobsterStore.processServerResponse(response);
  var testColorMap = LobsterStore.state.colorMap;
  assert.equal(Object.keys(testColorMap).length, 6);
  assert.equal((':mongos]' in testColorMap), true);
  assert.equal((':configsvr:secondary0]' in testColorMap), true);
  assert.equal((':configsvr:primary]' in testColorMap), true);
  assert.equal((':shard0:primary]' in testColorMap), true);
  assert.equal((':configsvr:secondary1]' in testColorMap), true);
  assert.equal((':configsvr' in testColorMap), false);
  assert.equal((':shard0' in testColorMap), false);
});
