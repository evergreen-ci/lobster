// @flow strict

import type { Log, Event, FixtureLogList, MongoLine, LogEvent } from '../../models';

const LOG = 'Log';
const RESMOKE_LOGGING_PREFIX = new RegExp('\[.*?\]');
const TIME_RE = new RegExp(String.raw`(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d{3})`);
const MONGO_TS_PREFIX_LENGTH = ('2017-01-23T19:51:55.058').length;
const DEFAULT_THREAD_ID = '[NO_THREAD]';

const eventMatcherList = {
  // Lifecycle events
  serverStartEvent: {
    matchRegEx: [new RegExp(String.raw`MongoDB starting : pid=(?<pid>\d+) port=(?<port>\d+)`), new RegExp(String.raw`bridge waiting for connections on port (?<port>\d+)`)],
    matcher: serverStartEventMatcher
  },
  serverStartMongosEvent: {
    matchRegEx: new RegExp(String.raw`mongos version `),
    matcher: serverStartEventMatcher
  },
  serverShutdownStartEvent: {
    matchRegEx: new RegExp(String.raw`got signal (?<signal>\d+) \((?<signal_str>\w+)\)`),
    matcher: serverShutdownEventMatcher
  },
  serverShutdownCompleteEvent: {
    matchRegEx: new RegExp(String.raw`dbexit:  rc: \d+`),
    matcher: serverShutdownEventMatcher
  },

  // Replica set events
  replicasetReconfigEvent: {
    matchRegEx: new RegExp(String.raw`New replica set config in use: (?<config>.*)$`),
    matcher: replicasetReconfigEventMatcher
  },
  transitionEvent: {
    matchRegEx: new RegExp(String.raw`transition to (?P<state>\w*) from`),
    matcher: transitionEventMatcher
  },
  stepDownEvent: {
    matchRegEx: new RegExp(String.raw`Stepping down from primary`),
    matcher: stepDownEventMatcher
  },
  electionDryRunEvent: {
    matchRegEx: new RegExp(String.raw`conducting a dry run election`),
    matcher: electionDryRunEventMatcher
  },
  electionDryRunFailEvent: {
    matchRegEx: new RegExp(String.raw`not running for primary`),
    matcher: electionDryRunEventMatcher
  },
  electionStartEvent: {
    matchRegEx: [new RegExp(String.raw`dry election run succeeded, running for election`), new RegExp(String.raw`running for election; slept last election`)],
    matcher: electionStartEventMatcher
  },
  electionFailEvent: {
    matchRegEx: new RegExp(String.raw`couldn't elect self`),
    matcher: electionEventMatcher
  },
  electionVoteEvent: {
    matchRegEx: new RegExp(String.raw`VoteRequester`),
    matcher: electionEventMatcher
  },
  electionSuccessEvent: {
    matchRegEx: new RegExp(String.raw`election succeeded`),
    matcher: electionSuccessEventMatcher
  },
  initialSyncStartEvent: {
    matchRegEx: new RegExp(String.raw`initial sync pending`),
    matcher: initialSyncEventMatcher
  },
  initialSyncSuccessEvent: {
    matchRegEx: new RegExp(String.raw`initial sync done`),
    matcher: initialSyncEventMatcher
  },
  heartbeatScheduledEvent: {
    matchRegEx: new RegExp(String.raw`Scheduling heartbeat to (?<node>[\w:-]+) at (?<time>.*)$`),
    matcher: heartbeatScheduledEventMatcher
  },
  heartbeatSentEvent: {
    matchRegEx: new RegExp(String.raw`Sending heartbeat \(requestId: (?<req_id>\d+)\) to (?<node>[\w:-]+)`),
    matcher: heartbeatEventMatcher
  },
  heartbeatReceivedEvent: {
    matchRegEx: new RegExp(String.raw`Received response to heartbeat \(requestId: (?<req_id>\d+)\) from (?<node>[\w:-]+)`),
    matcher: heartbeatEventMatcher
  },

  // For Warning, Error and Fatal Events, check severity
  fixtureFatalEvent: { matcher: fixtureEventMatcher },
  fixtureWarningEvent: { matcher: fixtureEventMatcher },
  fixtureErrorEvent: { matcher: fixtureEventMatcher }
};

// Note: title in original code is set as 'FixtureLogEvent' for every event type
function initiateLogEvent(type: String, ts: Date, logLine: MongoLine): LogEvent {
  return ({
    type: type,
    title: 'FixtureLogEvent',
    ts: ts,
    messages: [],
    stacktrace: [],
    logLine: logLine
  });
}

// Matcher functions
function serverStartEventMatcher(logLine: MongoLine): ?LogEvent {
  const ssEvent = initiateLogEvent('ServerStartEvent', logLine.ts, logLine);
  let match = eventMatcherList[serverStartEvent].matchRegEx[0].exec(logLine.messages[0]);
  if (match) {
    ssEvent.port = match.groups.port;
    ssEvent.pid = match.group.pid;
    return ssEvent;
  }
  if (match = eventMatcherList[serverStartEvent].matchRegEx[1].exec(logLine.messages[0])) {
    ssEvent.port = match.groups.port;
    return ssEvent;
  }
  if (logLine.thread === 'mongosMain') {
    match = eventMatcherList[serverStartMongosEvent].matchRegex.exec(logLine.messages[0]);
    if (match) {
      ssEvent.port = match.groups.port;
      ssEvent.pid = match.group.pid;
      return ssEvent;
    }
  }
  return null;
}

function serverShutdownEventMatcher(logLine: MongoLine): ?LogEvent {
  let match = eventMatcherList[serverShutdownStartEvent].matchRegEx.exec(logLine.messages[0]);
  const ssEvent = initiateLogEvent('ServerShutdownStartEvent', logLine.ts, logLine);
  if (match) {
    ssEvent.signal = match.groups.signal;
    ssEvent.signalStr = match.groups.signal_str;
    return ssEvent;
  }
  if (match = eventMatcherList[serverShutdownCompleteEvent].matchRegEx.exec(logLine.messages[0])) {
    ssEvent.type = 'ServerShutdownCompleteEvent';
    return ssEvent;
  }
  return null;
}

function replicasetReconfigEventMatcher(logLine: MongoLine): ?LogEvent {
  const match = eventMatcherList[replicasetReconfigEvent].matchRegEx.exec(logLine.messages[0]);
  if (match) {
    const rsEvent = initiateLogEvent('ReplicasetReconfigEvent', logLine.ts, logLine);
    rsEvent.config = match.groups.config;
    return rsEvent;
  }
  return null;
}

function transitionEventMatcher(logLine: MongoLine): ?LogEvent {
  if (logLine.logComponent === 'REPL') {
    return null;
  }
  const match = eventMatcherList[transitionEvent].matchRegEx.exec(logLine.messages[0]);
  if (match) {
    const tEvent = initiateLogEvent('TransitionEvent', logLine.ts, logLine);
    tEvent.state = match.groups.state;
    return tEvent;
  }
  return null;
}

function stepDownEventMatcher(logLine: MongoLine): ?LogEvent {
  const match = eventMatcherList[stepDownEvent].matchRegEx.exec(logLine.messages[0]);
  if (match) {
    const sdEvent = initiateLogEvent('StepDownEvent', logLine.ts, logLine);
    return sdEvent;
  }
  return null;
}

function electionDryRunEventMatcher(logLine: MongoLine): ?LogEvent {
  let match = eventMatcherList[electionDryRunEvent].matchRegEx.exec(logLine.messages[0]);
  const edrEvent = initiateLogEvent('ElectionDryRunEvent', logLine.ts, logLine);
  if (match) {
    return edrEvent;
  }
  match = eventMatcherList[electionDryRunFailEvent].matchRegEx.exec(logLine.messages[0]);
  if (match) {
    edrEvent.type = 'electionDryRunFailEvent';
    return edrEvent;
  }
  return null;
}

function electionStartEventMatcher(logLine: MongoLine): ?LogEvent {
  if (!logLine.messages) {
    return null;
  }
  const match0 = eventMatcherList[electionStartEvent].matchRegEx[0].exec(logLine.messages[0]);
  const match1 = eventMatcherList[electionStartEvent].matchRegExp[1].exec(logLine.messages[1]);
  if (match0 || match1) {
    const esEvent = initiateLogEvent('ElectionStartEvent', logLine.ts, logLine);
    return esEvent;
  }
  return null;
}

function electionEventMatcher(logLine: MongoLine): ?LogEvent {
  let match = eventMatcherList[electionVoteEvent].matchRegEx.exec(logLine.messages[0]);
  const eEvent = initiateLogEvent('ElectionVoteEvent', logLine.ts, logLine);
  if (match) {
    return eEvent;
  }
  match = eventMatcherList[electionFailEvent].matchRegEx.exec(logLine.messages[0]);
  if (match) {
    eEvent.type = 'ElectionFailEvent';
    return eEvent;
  }
  match = event;
  return null;
}

function electionSuccessEventMatcher(logLine: MongoLine): ?LogEvent {
  const match = eventMatcherList[electionSuccessEvent].matchRegEx.exec(logLine.messages[0]);
  if (match) {
    const esEvent = initiateLogEvent('ElectionSuccessEvent', logLine.ts, logLine);
    esEvent.startEvent = null;
    esEvent.voteEvents = [];
    return esEvent;
  }
  return null;
}

function initialSyncEventMatcher(logLine: MongoLine): ?LogEvent {
  let match = eventMatcherList[initialSyncStartEvent].matchRegEx.exec(logLine.messages[0]);
  const isEvent = initiateLogEvent('InitialSyncStartEvent', logLine.ts, logLine);
  if (match) {
    return isEvent;
  }
  match = eventMatcherList[initialSyncSuccessEvent].matchRegEx.exec(logLine.messages[0]);
  if (match) {
    isEvent.type = 'InitialSyncSuccessEvent';
    return isEvent;
  }
  return null;
}

function heartbeatScheduledEventMatcher(logLine: MongoLine): ?LogEvent {
  const match = eventMatcherList[heartbeatScheduledEvent].matchRegEx.exec(logLine.messages[0]);
  if (match) {
    const hsEvent = initiateLogEvent('HeartBeatScheduledEvent', logLine.ts, logLine);
    hsEvent.node = match.groups.node;
    hsEvent.time = match.groups.time;
    return hsEvent;
  }
  return null;
}

function heartbeatEventMatcher(logLine: MongoLine): ?LogEvent {
  let match = eventMatcherList[heartbeatSentEvent].matchRegEx.exec(logLine.messages[0]);
  if (match) {
    const hsEvent = initiateLogEvent('HeartbeatSentEvent', logLine.ts, logLine);
    hsEvent.requestId = match.groups.requestId;
    hsEvent.node = match.groups.node;
    return hsEvent;
  }
  match = eventMatcherList[heartbeatReceivedEvent].matchRegEx.exec(logLine.messages[0]);
  if (match) {
    const hrEvent = initiateLogEvent('HeartbeatReceivedEvent', logLine.ts, logLine);
    hrEvent.requestId = match.groups.requestId;
    hrEvent.node = match.groups.node;
    return hrEvent;
  }
  return null;
}

function fixtureEventMatcher(logLine: MongoLine): ?LogEvent {
  if (logLine.severity === 'F') {
    return initiateLogEvent('FixtureFatalEvent', logLine.ts, logLine);
  }
  if (logLine.severity === 'W') {
    return initiateLogEvent('FixtureWarningEvent', logLine.ts, logLine);
  }
  if (logLine.severity === 'E') {
    return initiateLogEvent('FixtureErrorEvent', logLine.ts, logLine);
  }
  return null;
}

// Create an event for given logline if it corresponds to one
function getEvent(logLine: MongoLine): Event {
  const events = eventMatcherList.keys();
  for (let i = 0; i < events.length; i++) {
    const currEvent = eventMatcherList[events[i]].matcher(logLine);
    if (currEvent) {
      return currEvent;
    }
  }
  return null;
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

function addEvent(logLine: MongoLine, events: LogEvent[]): LogEvent[] {
  if (logLine === null) {
    return null;
  }
  const event = getEvent(logLine);
  if (event) {
    const newEvents = events.slice();
    newEvents.push(event);
    return newEvents;
  }
  return null;
}

function returnMongoLine(ts: Date, line: string): MongoLine {
  const components = line.split(' ', 4);
  return ({
    rawTs: components[0], severity: components[1], logComponent: components[2], thread: components[3].substring(1, components[3].length - 1),
    messages: components.length === 5 ? [components[4]] : []
  });
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
        fixtureLogLists[prefix.fixtureId] = newBodyList;
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
