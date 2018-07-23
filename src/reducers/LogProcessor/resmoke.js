// @flow strict

import type { Log, Event, FixtureLogList, MongoLine, LogEvent } from '../../models';

const RESMOKE_LOGGING_PREFIX = new RegExp('\[.*?\]');
const TIME_RE = new RegExp(String.raw`(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d{3})`);
const MONGO_TS_PREFIX_LENGTH = ('2017-01-23T19:51:55.058').length;
const DEFAULT_THREAD_ID = '[NO_THREAD]';
const eventMatcherList = {};
const SERVER_START = 'ServerStart';
const SERVER_SHUTDOWN_START = 'ServerShutdownStart';
const SERVER_SHUTDOWN_COMPLETE = 'ServerShutdownComplete';
const FATAL = 'Fatal';
const ERROR = 'Error';
const WARNING = 'Warning';
const LOG = 'Log';
const STATE = 'State';
const ELECTION_SUCCESS = 'ElectionSuccess';

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

// // Lifecycle event matcher functions
eventMatcherList.serverStartEvent = (logLine: MongoLine): ?LogEvent => {
  const matchRegEx = [
    new RegExp(String.raw`MongoDB starting : pid=(?<pid>\d+) port=(?<port>\d+)`),
    new RegExp(String.raw`bridge waiting for connections on port (?<port>\d+)`),
    new RegExp(String.raw`mongos version `)
  ];
  const ssEvent = initiateLogEvent('ServerStartEvent', logLine.ts, logLine);
  let match = matchRegEx[0].exec(logLine.messages[0]);
  if (match) {
    ssEvent.port = match.groups.port;
    ssEvent.pid = match.group.pid;
    return ssEvent;
  }
  match = matchRegEx[1].exec(logLine.messages[0]);
  if (match) {
    ssEvent.port = match.groups.port;
    return ssEvent;
  }
  if (logLine.thread === 'mongosMain') {
    match = matchRegEx[2].exec(logLine.messages[0]);
    if (match) {
      ssEvent.port = match.groups.port;
      ssEvent.pid = match.group.pid;
      return ssEvent;
    }
  }
  return null;
};

eventMatcherList.serverShutdownStartEvent = (logLine: MongoLine): ?LogEvent => {
  const matchRegEx = [
    new RegExp(String.raw`got signal (?<signal>\d+) \((?<signal_str>\w+)\)`),
    new RegExp(String.raw`dbexit:  rc: \d+`)
  ];
  let match = matchRegEx[0].exec(logLine.messages[0]);
  const ssEvent = initiateLogEvent('ServerShutdownStartEvent', logLine.ts, logLine);
  if (match) {
    ssEvent.signal = match.groups.signal;
    ssEvent.signalStr = match.groups.signal_str;
    return ssEvent;
  }
  match = matchRegEx[1].exec(logLine.messages[0]);
  if (match) {
    ssEvent.type = 'ServerShutdownCompleteEvent';
    return ssEvent;
  }
  return null;
};

eventMatcherList.serverShutdownCompleteEvent = eventMatcherList.serverShutdownStartEvent;

// Replica set event matcher functions
eventMatcherList.replicasetReconfigEvent = (logLine: MongoLine): ?LogEvent => {
  const matchRegEx = new RegExp(String.raw`New replica set config in use: (?<config>.*)$`);
  const match = matchRegEx.exec(logLine.messages[0]);
  if (match) {
    const rsEvent = initiateLogEvent('ReplicasetReconfigEvent', logLine.ts, logLine);
    rsEvent.config = match.groups.config;
    return rsEvent;
  }
  return null;
};

eventMatcherList.transitionEvent = (logLine: MongoLine): ?LogEvent => {
  const matchRegEx = new RegExp(String.raw`transition to (?P<state>\w*) from`);
  if (logLine.logComponent === 'REPL') {
    return null;
  }
  const match = matchRegEx.exec(logLine.messages[0]);
  if (match) {
    const tEvent = initiateLogEvent('TransitionEvent', logLine.ts, logLine);
    tEvent.state = match.groups.state;
    return tEvent;
  }
  return null;
};

eventMatcherList.stepDownEvent = (logLine: MongoLine): ?LogEvent => {
  const matchRegEx = new RegExp(String.raw`Stepping down from primary`);
  const match = matchRegEx.exec(logLine.messages[0]);
  if (match) {
    const sdEvent = initiateLogEvent('StepDownEvent', logLine.ts, logLine);
    return sdEvent;
  }
  return null;
};

eventMatcherList.electionDryRunEvent = (logLine: MongoLine): ?LogEvent => {
  const matchRegEx = [
    new RegExp(String.raw`conducting a dry run election`),
    new RegExp(String.raw`not running for primary`)
  ];
  let match = matchRegEx[0].exec(logLine.messages[0]);
  const edrEvent = initiateLogEvent('ElectionDryRunEvent', logLine.ts, logLine);
  if (match) {
    return edrEvent;
  }
  match = matchRegEx[1].exec(logLine.messages[0]);
  if (match) {
    edrEvent.type = 'ElectionDryRunFailEvent';
    return edrEvent;
  }
  return null;
};

eventMatcherList.electionDryRunFailEvent = eventMatcherList.electionDryRunEvent;

eventMatcherList.electionStartEvent = (logLine: MongoLine): ?LogEvent => {
  const matchRegEx = [new RegExp(String.raw`dry election run succeeded, running for election`), new RegExp(String.raw`running for election; slept last election`)];
  if (!logLine.messages) {
    return null;
  }
  const match0 = matchRegEx[0].exec(logLine.messages[0]);
  const match1 = matchRegEx[1].exec(logLine.messages[1]);
  if (match0 || match1) {
    const esEvent = initiateLogEvent('ElectionStartEvent', logLine.ts, logLine);
    return esEvent;
  }
  return null;
};

eventMatcherList.electionVoteEvent = (logLine: MongoLine): ?LogEvent => {
  const matchRegEx = [new RegExp(String.raw`VoteRequester`), new RegExp(String.raw`couldn't elect self`)];
  let match = matchRegEx[0].exec(logLine.messages[0]);
  const eEvent = initiateLogEvent('ElectionVoteEvent', logLine.ts, logLine);
  if (match) {
    return eEvent;
  }
  match = matchRegEx[1].exec(logLine.messages[0]);
  if (match) {
    eEvent.type = 'ElectionFailEvent';
    return eEvent;
  }
  match = event;
  return null;
};

eventMatcherList.electionFailEvent = eventMatcherList.electionVoteEvent;

eventMatcherList.electionSuccessEvent = (logLine: MongoLine): ?LogEvent => {
  const matchRegEx = new RegExp(String.raw`election succeeded`);
  const match = matchRegEx.exec(logLine.messages[0]);
  if (match) {
    const esEvent = initiateLogEvent('ElectionSuccessEvent', logLine.ts, logLine);
    esEvent.startEvent = null;
    esEvent.voteEvents = [];
    return esEvent;
  }
  return null;
};

eventMatcherList.initialSyncStartEvent = (logLine: MongoLine): ?LogEvent => {
  const matchRegEx = [new RegExp(String.raw`initial sync pending`), new RegExp(String.raw`initial sync done`)];
  let match = matchRegEx[0].exec(logLine.messages[0]);
  const isEvent = initiateLogEvent('InitialSyncStartEvent', logLine.ts, logLine);
  if (match) {
    return isEvent;
  }
  match = matchRegEx[1].exec(logLine.messages[0]);
  if (match) {
    isEvent.type = 'InitialSyncSuccessEvent';
    return isEvent;
  }
  return null;
};

eventMatcherList.initialSyncSuccessEvent = eventMatcherList.initialSyncStartEvent;

eventMatcherList.heartbeatScheduledEvent = (logLine: MongoLine): ?LogEvent => {
  const matchRegEx = new RegExp(String.raw`Scheduling heartbeat to (?<node>[\w:-]+) at (?<time>.*)$`);
  const match = matchRegEx.exec(logLine.messages[0]);
  if (match) {
    const hsEvent = initiateLogEvent('HeartBeatScheduledEvent', logLine.ts, logLine);
    hsEvent.node = match.groups.node;
    hsEvent.time = match.groups.time;
    return hsEvent;
  }
  return null;
};

eventMatcherList.heartbeatSentEvent = (logLine: MongoLine): ?LogEvent => {
  const matchRegEx = [
    new RegExp(String.raw`Sending heartbeat \(requestId: (?<req_id>\d+)\) to (?<node>[\w:-]+)`),
    new RegExp(String.raw`Received response to heartbeat \(requestId: (?<req_id>\d+)\) from (?<node>[\w:-]+)`)
  ];
  let match = matchRegEx[0].exec(logLine.messages[0]);
  if (match) {
    const hsEvent = initiateLogEvent('HeartbeatSentEvent', logLine.ts, logLine);
    hsEvent.requestId = match.groups.requestId;
    hsEvent.node = match.groups.node;
    return hsEvent;
  }
  match = matchRegEx[1].exec(logLine.messages[0]);
  if (match) {
    const hrEvent = initiateLogEvent('HeartbeatReceivedEvent', logLine.ts, logLine);
    hrEvent.requestId = match.groups.requestId;
    hrEvent.node = match.groups.node;
    return hrEvent;
  }
  return null;
};

eventMatcherList.heartbeatReceivedEvent = eventMatcherList.heartbeatSentEvent;

// Severity check matcher functions
eventMatcherList.fixtureFatalEvent = (logLine: MongoLine): ?LogEvent => {
  if (logLine.severity === 'F') {
    return initiateLogEvent('FixtureFatalEvent', logLine.ts, logLine);
  }
  return null;
};

eventMatcherList.fixtureWarningEvent = (logLine: MongoLine): ?LogEvent => {
  if (logLine.severity === 'F') {
    return initiateLogEvent('FixtureWarningEvent', logLine.ts, logLine);
  }
  return null;
};

eventMatcherList.fixtureErrorEvent = (logLine: MongoLine): ?LogEvent => {
  if (logLine.severity === 'F') {
    return initiateLogEvent('FixtureErrorEvent', logLine.ts, logLine);
  }
  return null;
};

// Create an event for given logline if it corresponds to one
function getLogEvent(logLine: MongoLine): Event {
  const events = eventMatcherList.keys();
  for (let i = 0; i < events.length; i++) {
    const currEvent = eventMatcherList[events[i]](logLine);
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
    currentElectionVoteEvents: [],
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

function updateElectionContext(evt: LogEvent, fll: FixtureLogList): FixtureLogList {
  const currentElectionStartEvent = fll.currentElectionStartEvent;
  const currentElectionVoteEvents = fll.currentElectionVoteEvents;
  if (evt.type === 'ElectionStartEvent') {
    currentElectionStartEvent = event;
    currentElectionVoteEvents = [];
  } else if (evt.type === 'ElectionVoteEvent') {
    currentElectionVoteEvents.push(event);
  } else if (evt.type === 'ElectionFailEvent') {
    currentElectionStartEvent = null;
    currentElectionVoteEvents = null;
  } else if (evt === 'ElectionSuccessEvent') {
    evt.startEvent = currentElectionStartEvent;
    evt.voteEvents = currentElectionVoteEvents;
    currentElectionStartEvent = null;
    currentElectionVoteEvents = [];
  }
  return ({
    currentElectionStartEvent: currentElectionStartEvent,
    currentElectionVoteEvents: currentElectionVoteEvents,
    evt: evt
  });
}

function addLogEvent(logLine: MongoLine, events: LogEvent[]): LogEvent[] {
  if (logLine === null) {
    return null;
  }
  const evt = getLogEvent(logLine);
  if (evt) {
    const newEvents = events.slice();
    newEvents.push(evt);
    return newEvents;
  }
  return null;
}

function returnMongoLine(ts: Date, line: string): MongoLine {
  const components = line.split(' ', 4);
  return ({
    ts: ts,
    rawTs: components[0], severity: components[1], logComponent: components[2], thread: components[3].substring(1, components[3].length - 1),
    messages: components.length === 5 ? [components[4]] : []
  });
}

function replaceLastEvent(events: LogEvent[], evt: LogEvent): LogEvent[] {
  events[events.length - 1] = evt;
  return events;
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
    fll.curLogLine = returnMongoLine(ts, line);
    const oldEvents = fll.events;
    fll.events = addLogEvent(fll.curLogLine, fll.events, fll);
    if (oldEvents.length !== fll.events.length) {
      const updated = updateElectionContext(fll.events[fll.events.length - 1]);
      fll.currentElectionStartEvent = updated.currentElectionStartEvent;
      fll.currentElectionVoteEvents = updated.currentElectionVoteEvents;
      fll.events = replaceLastEvent(fll.events, updated.evt);
    }
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

function makeEvent(type: string, start: Date, end: Date, fixtureId: string): Event {
  return ({
    type: type,
    start: start.toISOString(),
    end: end.toISOString(),
    fixtureId: fixtureId
  });
}

function makeEventWithLine(type: string, start: Date, end: Date, fixtureId: string, line: MongoLine): Event {
  return ({
    type: type,
    start: start.toISOString(),
    end: end.toISOString(),
    fixtureId: fixtureId,
    line: line
  });
}

function getStateEvent(tmpEvents: {String: Event}, end: Date): Event {
  const startEvent = tmpEvents[STATE];
  startEvent.end = end.toISOString();
  return startEvent;
}

function parseTestLog(processed) {
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

function readTests(processed) {
  const events = []; // Event[] type
  const tmpEvents = {};
  console.log('Processing test logs');
  const fixtureLogLists = parseTestLog(processed);
  const fixtureIdList = fixtureLogLists.keys();
  for (let i = 0; i < fixtureIdList.length; i++) {
    let fixtureId = fixtureIdList[i];
    const logList = fixtureLogLists[fixtureId];
    if (logList.isConfigsvr) {
      fixtureId = fixtureId + ' - config';
    } else if (logList.isMongos) {
      fixtureId = fixtureId + ' - mongos';
    }
    console.log('Reading events for fixture ' + fixtureId);
    // Add event for duration of logs
    events.push(makeEvent(LOG, logList.start, logList.end, fixtureId));
    tmpEvents = {};
    const lastTs = null;
    for (let j = 0; j < logList.events.length; j++) {
      const evt = logList.events[j];
      if (evt.ts === null) {
        continue;
      }
      lastTs = event.ts;
      if (evt.type === 'ServerStartEvent') {
        events.push(makeEvent(SERVER_START, evt.ts, evt.ts, fixtureId));
      } else if (evt.type === 'ServerShutdownStart') {
        events.push(makeEvent(SERVER_SHUTDOWN_START, evt.ts, evt.ts, fixtureId));
      } else if (evt.type === 'ServerShutdownComplete') {
        events.push(makeEvent(SERVER_SHUTDOWN_COMPLETE, evt.ts, evt.ts, fixtureId));
      } else if (evt.type === 'FixtureFatalEvent') {
        events.push(makeEventWithLine(FATAL, evt.ts, evt.ts, fixtureId, evt.logLine));
      } else if (evt.type === 'FixtureErrorEvent') {
        events.push(makeEventWithLine(ERROR, evt.ts, evt.ts, fixtureId, evt.logLine));
      } else if (evt.type === 'FixtureWarningEvent') {
        events.push(makeEventWithLine(WARNING, evt.ts, evt.ts, fixtureId, evt.logLine));
      } else if (evt.type === 'TransitionEvent') {
        if (tmpEvents.keys().includes(STATE)) {
          events.push(getStateEvent(tmpEvents, evt.ts));
          delete tmpEvents[STATE];
        }
        const newEvent = { type: STATE, start: evt.ts.toISOString(),
          fixtureId: fixtureId, line: evt.logLine, state: evt.state };
        tmpEvents[STATE] = newEvent;
      } else if (evt.type === 'ElectionSuccessEvent') {
        events.push(makeEvent(ELECTION_SUCCESS, evt.ts, evt.ts, fixtureId));
      }
    }
    if (tmpEvents.keys().includes(STATE)) {
      events.push(getStateEvent(tmpEvents, lastTs));
      delete tmpEvents[STATE];
    }
  }
  return events;
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
  return {
    lines: processed,
    colorMap: colorMap,
    isDone: true,
    events: readTests(processed)
  };
}
