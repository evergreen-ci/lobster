// @flow

import resmoke from './resmoke';
import path from 'path';
import fs from 'fs';

describe('events', function() {
  test('sharding-migration-fail', function() {
    const inState = {
      lines: [],
      events: [],
      identity: null,
      isDone: false,
      colorMap: {}
    };
    const rawFilePath = path.resolve('.') + '/src/reducers/logProcessor/shardingRaw.txt';
    const rawFile = fs.readFileSync(rawFilePath).toString();
    const state = resmoke(inState, rawFile);
    const comparisonPath = path.resolve('.' + '/src/reducers/logProcessor/sharding.json');
    const comparisonFile = fs.readFileSync(comparisonPath, 'utf8');
    const comparisonJSON = JSON.parse(comparisonFile);
    expect(state.events).toEqual(comparisonJSON);
    expect(state.events).toHaveLength(comparisonJSON.length);
  });

  test('validate-collections', function() {
    const inState = {
      lines: [],
      events: [],
      identity: null,
      isDone: false,
      colorMap: {}
    };
    const rawFilePath = path.resolve('.') + '/src/reducers/logProcessor/validateCollectionsRaw.txt';
    const rawFile = fs.readFileSync(rawFilePath).toString();
    const state = resmoke(inState, rawFile);
    const validateCollectionsPath = path.resolve('.' + '/src/reducers/logProcessor/validateCollections.json');
    const validateCollectionsFile = fs.readFileSync(validateCollectionsPath, 'utf8');
    const validateCollectionsJSON = JSON.parse(validateCollectionsFile);
    expect(state.events).toEqual(validateCollectionsJSON);
    expect(state.events).toHaveLength(validateCollectionsJSON.length);
  });
});
