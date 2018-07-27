// @flow

import assert from 'assert';
import resmoke from './resmoke';
import path from 'path';
import fs from 'fs';

describe('events', function() {
  test('sharding-migration-fail', function() {
    console.log('testing events');
    const rawFilePath = path.resolve('.') + '/src/reducers/LogProcessor/5b4626c2f84ae87f0a04e70c.txt';
    const rawFile = fs.readFileSync(rawFilePath).toString();
    const state = resmoke(rawFile);
    const comparisonPath = path.resolve('.' + '/src/reducers/LogProcessor/comparison.json');
    const comparisonFile = fs.readFileSync(comparisonPath, 'utf8');
    const comparisonJSON = JSON.parse(comparisonFile);
    expect(state.events).toEqual(comparisonJSON);
    assert.equal(state.events.length, comparisonJSON.length);
  });
});
