// @flow strict

import type { Log, Event, FixtureLogList, MongoLine } from '../../models';

const LOG = 'Log';
const RESMOKE_LOGGING_PREFIX = new RegExp('\[.*?\]');
const TIME_RE = new RegExp(String.raw`(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d{3})`);
const MONGO_TS_PREFIX_LENGTH = ('2017-01-23T19:51:55.058').length;
const DEFAULT_THREAD_ID = '[NO_THREAD]';

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

function parseMongoTs(line: string): Date {
  const match = TIME_RE.exec(line.substring(0, MONGO_TS_PREFIX_LENGTH));
  if (!match) {
    return null;
  }
  return new Date(match[0], match[1], match[2], match[3], match[4], match[5], match[6] * 1000);
}

function initiateFixtureLogList(): FixtureLogList {
  return ({
    isResmoke: false,
    isConfigsvr: false,
    isMongos: false,
    isShard: false,
    isBridge: false,
    isMongoProcess: false,
    curThread: '',
    curLogLine: null, // type is MongoLine
    events: [],
    currentElectionStartEvent: null,
    currentElectionVoteEvent: [],
    logStart: null,
    logEnd: null,
    logLines: {} // type this dictionary Dict{string, MongoLine[]}
  });
}

function updateTimeRange(fll: FixtureLogList, ts: Date): FixtureLogList {
  const logStart = fll.logStart;
  const logEnd = fll.logEnd;
  if (fll.logStart === null || ts < fll.logStart) {
    logStart = ts;
  }
  if (fll.logEnd === null || ts > fll.logEnd) {
    logEnd = ts;
  }
  return ({ logStart: logStart, logEnd: logEnd });
}

function addEvent(logLine: MongoLine): MongoLine {
  if (logLine === null) {
    return null;
  }
}

function appendFixtureLogList(fll: FixtureLogList, line: string): FixtureLogList {
  const ts = parseMongoTs(line);
  if (!ts) {
    if (!fll.curThread) {
      fll.curLogLine = fll.logLines[DEFAULT_THREAD_ID][0];
      fll.curThread = DEFAULT_THREAD_ID;
    }
    const curLogLine = fll.curLogLine;
    curLogLine.messages.push(line);
    fll.curLogLine = curLogLine;
  } else {
    const updatedTime = updateTimeRange(fll, ts);
    fll.logStart = updatedTime.logStart;
    fll.logEnd = updatedTime.logEnd;
    addEvent(); // TODO check out events/event factory
    fll.curLogLine = returnMongoLine(ts, line);
    fll.curThread = fll.curLogLine.thread;

    // Add new curLogLine to loglines list corresponding to thread
    const mongoLinesList = fll.logLines[fll.curThread];
    mongoLinesList.push(fll.curLogLine);
    fll.logLines[fll.curThread] = mongoLinesList;
  }
  return fll;
}

function returnMongoLine(ts: Date, line: string): MongoLine {
  const components = line.split(' ', 4);
  return ({
    rawTs: components[0], severity: components[1], logComponent: components[2], thread: components[3].substring(1, components[3].length - 1),
    messages: components.length === 5 ? [components[4]] : []
  });
}

function addEvent(currentEvents: Event[], type: string, start: string, end: string): Event[] {
  const events = currentEvents.slice();
  events.push({
    type: type,
    start: start,
    end: end
  });
  return events;
}

function loggingPrefix(rawPrefix: string): string {
  const shellPrefixes = ['js_test', 'BackgroundInitialSync', 'CheckReplDBHash', 'CheckReplOplogs', 'CleanEveryN', 'IntermediateInitialSync', 'PeriodicKillSecondaries', 'ValidateCollections'];
  const prefixes = rawPrefix.substring(1, rawPrefix.length - 1).split(':', 2);
  const isShell = shellPrefixes.includes(prefixes[0]);
  const fixtureId = '';
  if (isShell) {
    if (prefixes.length === 2) {
      fixtureId = 'standalone_mongod';
    } else {
      fixtureId = prefixes[2];
    }
  }
  return ({
    prefixes: prefixes,
    jobNum: prefixes[1],
    isFixture: prefixes[0].endsWith('Fixture'),
    isShell: isShell,
    fixtureId: fixtureId
  });
}

function presplitLine(line: string) {
  let splits = line.split(' ', 1);
  if (!splits || !RESMOKE_LOGGING_PREFIX.match(splits[0])) {
    return ({ prefix: null, body: line });
  }
  let body = '';
  const prefix = loggingPrefix(splits[0]);
  if (prefix.isShell) {
    splits = line.split(' ', 2);
    body = splits.length > 2 ? splits[2].trim() : '';
  } else {
    body = splits.length > 1 ? splits[1].trim() : '';
  }
  return ({
    prefix: prefix,
    body: body
  });
}

function parseTestLog(processed) {
  console.log('Processing test logs');
  const fixtureLogLists = {};
  for (let i = 0; i < processed.length; i++) {
    const line = processed[i];
    const presplit = presplitLine(line);
    if (presplit.prefix.isFixture) {
      const prefix = presplit.prefix;
      if (prefix.fixtureId in fixtureLogLists) {
        const modifyBodyList = fixtureLogLists[prefix.fixtureId];
        modifyBodyList = appendFixtureLogList(modifyBodyList, presplit.body);
        fixtureLogLists[prefix.fixtureId] = modifyBodyList;
      } else {
        const newBodyList = initiateFixtureLogList();
        newBodyList = appendFixtureLogList(newBodyList, presplit.body);
        fixtureLogList[prefix.fixtureId] = newBodyList;
      }
    }
  }
  const fixtureIdList = fixtureLogLists.keys();
  for (let j = 0; j < fixtureIdList.length; j++) {
    const fixtureId = fixtureIdList[j];
    const fixtureLogList = fixtureLogLists.get(fixtureId);
    if (typeof fixtureId !== 'number') {
      fixtureLogList.isResmoke = true;
    }
  }
  return fixtureLogLists;
}

export default function(response: string): Log {
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

    let lineText = line;
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
  parseTestLog(processed);
  return {
    lines: processed,
    colorMap: colorMap,
    isDone: true
  };
}
