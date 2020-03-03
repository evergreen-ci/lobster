// @flow strict

import type { Log, ResmokeLog } from '../../models';
import resmokeTestEvents from './resmokeTestEvents';

function getGitVersion(line: string): string {
  const gitVersionStr = 'git version: ';
  const gitVersionPos = line.indexOf(gitVersionStr);
  if (gitVersionPos !== -1) {
    return line.substr(gitVersionPos + gitVersionStr.length);
  }
  return 'master';
}

function getFullGitRef(fileLine: ?string, gitVersion: string): ?string {
  if (!fileLine) {
    return null;
  }
  const gitPrefix = 'https://github.com/mongodb/mongo/blob/';
  return gitPrefix + gitVersion + '/' + fileLine;
}

export default function(state: Log, response: string): Log {
  // set the url to the url we requested
  const lines = response.split('\n');
  const processed = [];
  const gitPrefix = '{githash:';
  const gitPrefixLen = gitPrefix.length + 2;
  let gitVersionStr: string = 'master';
  const portRegex = / [sdbc](\d{1,5})\|/;
  const stateRegex = /(:shard\d*|:configsvr)?:(initsync|primary|mongos|secondary\d*|node\d*)]/;

  const colorMap = {};

  const colorList = [
    '#5aae61',
    '#9970ab',
    '#bf812d',
    '#2166ac',
    '#8c510a',
    '#1b7837',
    '#74add1',
    '#d6604d',
    '#762a83',
    '#35978f',
    '#de77ae'
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Only check the git version if we haven't seen it so far.
    if (gitVersionStr === 'master') {
      gitVersionStr = getGitVersion(line);
    }

    let lineText = parseLogLine(line);
    let gitRef: ?string = undefined;
    const gitStartIdx = line.indexOf(gitPrefix);
    if (gitStartIdx !== -1) {
      const gitStopIdx = line.indexOf('}', gitStartIdx);
      if (gitStopIdx > gitStartIdx + gitPrefixLen) {
        gitRef = line.substr(gitStartIdx + gitPrefixLen, gitStopIdx - (gitStartIdx + gitPrefixLen) - 1);
        lineText = line.substr(0, gitStartIdx - 1) + line.substr(gitStopIdx + 1);
      }
    }

    const portArray = portRegex.exec(line);
    let port = undefined;
    if (portArray) {
      port = portArray[1];
    } else {
      const stateArray = stateRegex.exec(line);
      if (stateArray) {
        port = stateArray[0];
      }
    }
    if (port && !colorMap[port]) {
      colorMap[port] = colorList[Object.keys(colorMap).length % colorList.length];
    }

    if (gitRef) {
      gitRef = getFullGitRef(gitRef, gitVersionStr);
    }

    processed.push({
      lineNumber: i,
      text: lineText,
      port: port,
      gitRef: gitRef
    });
  }
  // TODO: properly defer this in the cluster vis
  let events = [];
  /* global process:{} */
  if (process.env.NODE_ENV !== 'production') {
    events = resmokeTestEvents(processed);
  }
  return {
    identity: state.identity,
    lines: processed,
    colorMap: colorMap,
    isDone: true,
    events: events
  };
}

function parseLogLine(line: string): string {
  const logParts = line.split('|');
  if (logParts.length !== 2) {
    return line;
  }
  const structedLog = parseMongoJson(logParts[1]);
  if (structedLog === null) {
    return line;
  }
  return `${logParts[0]}| ${ structedLog.t.$date } ${ structedLog.s.padEnd(2) } ${ structedLog.c.padEnd(8)} ${ structedLog.id.toString().padEnd(7)} [${ structedLog.ctx }] ${ JSON.stringify(structedLog.msg) }${ structedLog.attr ? ',"attr":' + JSON.stringify(structedLog.attr) : '' }`;
}

function parseMongoJson(toParse: string): ResmokeLog | null {
  let log: ResmokeLog;
  try {
    log = JSON.parse(toParse);
  } catch (err) {
    return null;
  }
  return log
}
