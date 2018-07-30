// @flow

import assert from 'assert';
import resmoke from './resmoke';
import path from 'path';
import fs from 'fs';

describe('events', function() {
  test('sharding-migration-fail', function() {
    console.log('testing events: sharding');
    const rawFilePath = path.resolve('.') + '/src/reducers/logProcessor/shardingRaw.txt';
    const rawFile = fs.readFileSync(rawFilePath).toString();
    const state = resmoke(rawFile);
    const comparisonPath = path.resolve('.' + '/src/reducers/logProcessor/sharding.json');
    const comparisonFile = fs.readFileSync(comparisonPath, 'utf8');
    const comparisonJSON = JSON.parse(comparisonFile);
    expect(state.events).toEqual(comparisonJSON);
    assert.equal(state.events.length, comparisonJSON.length);
  });

  test('validate-collections', function() {
    console.log('testing events: validate collections');
    const rawFilePath = path.resolve('.') + '/src/reducers/logProcessor/validateCollectionsRaw.txt';
    const rawFile = fs.readFileSync(rawFilePath).toString();
    const state = resmoke(rawFile);
    const validateCollectionsPath = path.resolve('.' + '/src/reducers/LogProcessor/validateCollections.json');
    const validateCollectionsFile = fs.readFileSync(validateCollectionsPath, 'utf8');
    const validateCollectionsJSON = JSON.parse(validateCollectionsFile);
    expect(state.events).toEqual(validateCollectionsJSON);
    assert.equal(state.events.length, validateCollectionsJSON.length);
  });
});
