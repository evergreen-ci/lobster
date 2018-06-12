import assert from 'assert';
import {LobsterStore} from '../stores';

test('Store-Line-Colors', function() {
  const data = [
    '[ShardedClusterFixture:job0:configsvr:secondary0]',
    '[SomeTest:job0:mongos]',
    '[HelloWorld:job1:configsvr:primary]',
    '[ShardsForDays:job0:shard0:primary]',
    '[ColorsTesting:job1:configsvr:secondary1]',
    '[Cclluusstteerr:job0:shard0:primary]',
    '[TryToFixYou:job0:mongos]',
    '[ShardTooHard:job2:shard0:primary]',
    '[AnotherOne:job1:shard0:secondary1]'
  ];

  const response = {
    data: data.join('\n')
  };
  LobsterStore.processServerResponse(response);
  const testColorMap = LobsterStore.state.colorMap;
  assert.equal(Object.keys(testColorMap).length, 6);

  const checkKeysExist = [
    ':mongos]',
    ':configsvr:secondary0]',
    ':configsvr:primary]',
    ':configsvr:secondary1]'
  ];

  const checkKeysDoNotExist = [
    ':configsvr',
    ':shard0',
    ':shard0:primary1]'
  ];

  // Test if certain keys exist or do not exist in testColorMap
  for (let i = 0; i < checkKeysExist.length; i++) {
    assert.equal((checkKeysExist[i] in testColorMap), true);
  }
  for (let j = 0; j < checkKeysDoNotExist.length; j++) {
    assert.equal((checkKeysDoNotExist[j] in testColorMap), false);
  }

  // Filter out any duplicate values from testColorMap
  const values = Object.keys(testColorMap).map(function(key) {
    return testColorMap[key];
  });
  const filteredValues = values.filter(function(item, pos) {
    return values.indexOf(item) === pos;
  });

  // Test if filtering out duplicates does not change testColorMap
  assert.equal(filteredValues.length, Object.keys(testColorMap).length);
});
