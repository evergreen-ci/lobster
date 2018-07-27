// @flow strict

import type { Log, Event, FixtureLogList, MongoLine, LogEvent,
  ShellLogLine, ShellLogList, Prefix, Processed, ElectionUpdate } from '../../models';

const RESMOKE_LOGGING_PREFIX = /\[.*?\]/;
// $FlowFixMe
const SHELL_LINE_REGEX = new RegExp(String.raw`([a-z]+)([0-9]+)\|\s(.*)`);
// $FlowFixMe
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
// $FlowFixMe
const JS_STACK_REGEX = new RegExp(String.raw`(\S*)@(\S+\.js)(.*)`);

function dateToString(date: ?Date): string {
  if (date) {
    let newDate = date.toISOString();
    newDate = newDate.substring(0, newDate.length - 1) + '000';
    return newDate;
  }
  return '';
}

function formatLine(line: string): string {
  return line.length > 200 ? line.substring(0, 200) + '...' : line;
}

function logEventToString(logEvent: LogEvent): string {
  let message = '';
  const type = logEvent.type;
  const logComponent = logEvent.logLine ? logEvent.logLine.logComponent : '';
  const thread = logEvent.logLine ? (logEvent.logLine.thread ? logEvent.logLine.thread : '') : '';
  const severity = logEvent.logLine ? logEvent.logLine.severity : '';
  let ts = dateToString(logEvent.ts);
  ts = ts.slice(0, ts.length - 3) + '+0' + ts.slice(ts.length - 3);
  if (type === 'TransitionEvent') {
    const state = logEvent.state ? logEvent.state : '';
    const initialState = logEvent.initialState ? logEvent.initialState : '';
    message = `${ts} ${severity} ${logComponent} [${thread}] transition to ${state} from ${initialState}`;
  } else if (type === 'HeartBeatScheduledEvent') {
    const node = logEvent.node ? logEvent.node : '';
    const time = logEvent.time ? logEvent.time : '';
    message = `${ts} Heartbeat to ${node} scheduled at ${time}`;
  } else if (type === 'HeartbeatSentEvent') {
    const requestId = logEvent.requestId ? logEvent.requestId : '';
    const node = logEvent.node ? logEvent.node : '';
    message = `${ts} Heartbeat sent (requestId: ${requestId}) to ${node}`;
  } else if (type === 'HeartbeatReceivedEvent') {
    const requestId = logEvent.requestId ? logEvent.requestId : '';
    const node = logEvent.node ? logEvent.node : '';
    message = `${ts} Heartbeat response received (requestId: ${requestId}) from ${node}`;
  } else if (type === 'FixtureFatalEvent') {
    const fatalMessage = logEvent.logLine ? logEvent.logLine.messages.join('\n') : '';
    message = formatLine(`${ts} F ${logComponent} [${thread}] ${fatalMessage}`);
  } else if (type === 'FixtureWarningEvent') {
    const warningMessage = logEvent.logLine ? logEvent.logLine.messages.join('\n') : '';
    message = formatLine(`${ts} W ${logComponent} [${thread}] ${warningMessage}`);
  } else if (type === 'FixtureErrorEvent') {
    const errorMessage = logEvent.logLine ? logEvent.logLine.messages.join('\n') : '';
    message = formatLine(`${ts} E ${logComponent} [${thread}] ${errorMessage}`);
  } else {
    message = `${ts} ${type}`;
  }
  return message;
}

// function for splitting string with limits
function split(inputLine: string, separator: string, limit: number): string[] {
  const line = inputLine.replace(/  +/g, ' ');
  const firstSplit = line.split(separator);
  const remainingSplits = firstSplit.slice(0, limit);
  remainingSplits.push(firstSplit.slice(limit).join(separator));
  return remainingSplits;
}

// Note: title in original code is set as 'FixtureLogEvent' for every event type
function initiateLogEvent(type: string, ts: ?Date, logLine: MongoLine): LogEvent {
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
    // $FlowFixMe
    new RegExp(String.raw`MongoDB starting : pid=(\d+) port=(\d+)`),
    // $FlowFixMe
    new RegExp(String.raw`bridge waiting for connections on port (\d+)`),
    // $FlowFixMe
    new RegExp(String.raw`mongos version `)
  ];
  const ssEvent = initiateLogEvent('ServerStartEvent', logLine.ts, logLine);
  let match = matchRegEx[0].exec(logLine.messages[0]);
  if (match) {
    ssEvent.port = match[2];
    ssEvent.pid = match[1];
    return ssEvent;
  }
  match = matchRegEx[1].exec(logLine.messages[0]);
  if (match) {
    ssEvent.port = match[1];
    return ssEvent;
  }
  if (logLine.thread === 'mongosMain') {
    match = matchRegEx[2].exec(logLine.messages[0]);
    if (match) {
      return ssEvent;
    }
  }
  return null;
};

eventMatcherList.serverShutdownStartEvent = (logLine: MongoLine): ?LogEvent => {
  const matchRegEx = [
    // $FlowFixMe
    new RegExp(String.raw`got signal (\d+) \((\w+)\)`),
    // $FlowFixMe
    new RegExp(String.raw`dbexit:  rc: \d+`)
  ];
  let match = matchRegEx[0].exec(logLine.messages[0]);
  const ssEvent = initiateLogEvent('ServerShutdownStartEvent', logLine.ts, logLine);
  if (match) {
    ssEvent.signal = match[1];
    ssEvent.signalStr = match[2];
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
  // $FlowFixMe
  const matchRegEx = new RegExp(String.raw`New replica set config in use: (.*)$`);
  const match = matchRegEx.exec(logLine.messages[0]);
  if (match) {
    const rsEvent = initiateLogEvent('ReplicasetReconfigEvent', logLine.ts, logLine);
    rsEvent.config = match[1];
    return rsEvent;
  }
  return null;
};

eventMatcherList.transitionEvent = (logLine: MongoLine): ?LogEvent => {
  // $FlowFixMe
  const matchRegEx = new RegExp(String.raw`transition to (\w*) from (\w*)`);
  /*
  if (logLine.logComponent === 'REPL') {
    return null;
  }
  */
  const match = matchRegEx.exec(logLine.messages[0]);
  if (match) {
    const tEvent = initiateLogEvent('TransitionEvent', logLine.ts, logLine);
    tEvent.state = match[1];
    tEvent.initialState = match[2];
    return tEvent;
  }
  return null;
};

eventMatcherList.stepDownEvent = (logLine: MongoLine): ?LogEvent => {
  // $FlowFixMe
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
    // $FlowFixMe
    new RegExp(String.raw`conducting a dry run election`),
    // $FlowFixMe
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
  // $FlowFixMe
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
  // $FlowFixMe
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
  return null;
};

eventMatcherList.electionFailEvent = eventMatcherList.electionVoteEvent;

eventMatcherList.electionSuccessEvent = (logLine: MongoLine): ?LogEvent => {
  // $FlowFixMe
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
  // $FlowFixMe
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
  // $FlowFixMe
  const matchRegEx = new RegExp(String.raw`Scheduling heartbeat to ([\w:-]+) at (.*)$`);
  const match = matchRegEx.exec(logLine.messages[0]);
  if (match) {
    const hsEvent = initiateLogEvent('HeartBeatScheduledEvent', logLine.ts, logLine);
    hsEvent.node = match[1];
    hsEvent.time = match[2];
    return hsEvent;
  }
  return null;
};

eventMatcherList.heartbeatSentEvent = (logLine: MongoLine): ?LogEvent => {
  const matchRegEx = [
    // $FlowFixMe
    new RegExp(String.raw`Sending heartbeat \(requestId: (\d+)\) to ([\w:-]+)`),
    // $FlowFixMe
    new RegExp(String.raw`Received response to heartbeat \(requestId: (\d+)\) from ([\w:-]+)`)
  ];
  let match = matchRegEx[0].exec(logLine.messages[0]);
  if (match) {
    const hsEvent = initiateLogEvent('HeartbeatSentEvent', logLine.ts, logLine);
    hsEvent.requestId = match[1];
    hsEvent.node = match[2];
    return hsEvent;
  }
  match = matchRegEx[1].exec(logLine.messages[0]);
  if (match) {
    const hrEvent = initiateLogEvent('HeartbeatReceivedEvent', logLine.ts, logLine);
    hrEvent.requestId = match[1];
    hrEvent.node = match.groups[2];
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
  if (logLine.severity === 'W') {
    return initiateLogEvent('FixtureWarningEvent', logLine.ts, logLine);
  }
  return null;
};

eventMatcherList.fixtureErrorEvent = (logLine: MongoLine): ?LogEvent => {
  if (logLine.severity === 'E') {
    return initiateLogEvent('FixtureErrorEvent', logLine.ts, logLine);
  }
  return null;
};

// Create an event for given logline if it corresponds to one
function getLogEvent(logLine: MongoLine): ?LogEvent {
  const events = Object.keys(eventMatcherList);
  for (let i = 0; i < events.length; i++) {
    const currEvent = eventMatcherList[events[i]](logLine);
    if (currEvent) {
      return currEvent;
    }
  }
  return null;
}

function parseMongoTs(line: string): ?Date {
  const match = TIME_RE.exec(line.substring(0, MONGO_TS_PREFIX_LENGTH));
  if (!match) {
    return null;
  }
  return new Date(match[1], match[2] - 1, match[3], match[4] - 4, match[5], match[6], match[7]);
}

function initiateFixtureLogList(): FixtureLogList {
  const startupLogLine = { ts: null, rawTs: 'N/A', severity: 'N/A', logComponent: 'N/A', thread: DEFAULT_THREAD_ID, messages: [] };
  return ({
    isResmoke: false,
    isConfigsvr: false,
    isMongos: false,
    isShard: false,
    isMongoProcess: false,
    curThread: '',
    curLogLine: null, // type is MongoLine
    events: [],
    currentElectionStartEvent: null,
    currentElectionVoteEvents: [],
    logStart: null,
    logEnd: null,
    logLines: { '[NO_THREAD]': [startupLogLine] } // type this dictionary Dict{string, MongoLine[]}
  });
}

function updateTimeRange(fll: FixtureLogList, ts: Date): {[key: string]: ?Date} {
  let logStart = fll.logStart;
  let logEnd = fll.logEnd;
  if (logStart == null || ts < logStart) {
    logStart = ts;
  }
  if (logEnd == null || ts > logEnd) {
    logEnd = ts;
  }
  return ({ logStart: logStart, logEnd: logEnd });
}

function updateElectionContext(evt: LogEvent, fll: FixtureLogList): ElectionUpdate {
  let currentElectionStartEvent = fll.currentElectionStartEvent;
  let currentElectionVoteEvents = fll.currentElectionVoteEvents;
  if (evt.type === 'ElectionStartEvent') {
    currentElectionStartEvent = evt;
    currentElectionVoteEvents = [];
  } else if (evt.type === 'ElectionVoteEvent') {
    if (currentElectionVoteEvents) {
      currentElectionVoteEvents.push(evt);
    }
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
    return events;
  }
  const evt = getLogEvent(logLine);
  if (evt) {
    const newEvents = events.slice();
    newEvents.push(evt);
    return newEvents;
  }
  return events;
}

function returnMongoLine(ts: Date, line: string): MongoLine {
  const components = split(line, ' ', 4);
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
    if (curLogLine) {
      curLogLine.messages.push(line);
      fll.curLogLine = curLogLine;
    }
  } else {
    const updatedTime = updateTimeRange(fll, ts);
    fll.logStart = updatedTime.logStart;
    fll.logEnd = updatedTime.logEnd;
    fll.curLogLine = returnMongoLine(ts, line);
    const oldEvents = fll.events;
    fll.events = addLogEvent(fll.curLogLine, fll.events);
    if (oldEvents.length !== fll.events.length) {
      const updated = updateElectionContext(fll.events[fll.events.length - 1], fll);
      fll.currentElectionStartEvent = updated.currentElectionStartEvent;
      fll.currentElectionVoteEvents = updated.currentElectionVoteEvents;
      fll.events = replaceLastEvent(fll.events, updated.evt);
    }
    if (fll.curLogLine) {
      fll.curThread = fll.curLogLine.thread;
    }

    // Add new curLogLine to loglines list corresponding to thread
    if (!Object.keys(fll.logLines).includes(fll.curThread)) {
      fll.logLines[fll.curThread] = []; // initiate new MongoLine[]
    }
    if (fll.curThread !== null) {
      const mongoLinesList = fll.logLines[fll.curThread];
      if (fll.curLogLine) {
        mongoLinesList.push(fll.curLogLine);
        fll.logLines[fll.curThread] = mongoLinesList;
      }
    }
  }
  return fll;
}

function loggingPrefix(rawPrefix: string): Prefix {
  const shellPrefixes = ['js_test', 'BackgroundInitialSync', 'CheckReplDBHash', 'CheckReplOplogs', 'CleanEveryN', 'IntermediateInitialSync', 'PeriodicKillSecondaries', 'ValidateCollections'];
  const prefixes = split(rawPrefix.substring(1, rawPrefix.length - 1), ':', 2);
  const isShell = shellPrefixes.includes(prefixes[0]);
  let fixtureId = '';
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
    fixture_id: fixtureId
  });
}

function presplitLine(line: string) {
  let splits = split(line, ' ', 1);
  if (!splits || !RESMOKE_LOGGING_PREFIX.test(splits[0])) {
    return ({ prefix: null, body: line });
  }
  let body = '';
  const prefix = loggingPrefix(splits[0]);
  if (prefix.isShell) {
    splits = split(line, ' ', 2);
    body = splits.length > 2 ? splits[2].trim() : '';
  } else {
    body = splits.length > 1 ? splits[1].trim() : '';
  }
  return ({
    prefix: prefix,
    body: body
  });
}

function makeEvent(type: string, start: ?Date, end: ?Date, fixtureId: string): Event {
  return ({
    type: type,
    start: dateToString(start),
    end: dateToString(end),
    fixture_id: fixtureId
  });
}

function makeEventWithLine(type: string, start: ?Date, end: ?Date, fixtureId: string, line: LogEvent): Event {
  return ({
    type: type,
    start: dateToString(start),
    end: dateToString(end),
    fixture_id: fixtureId,
    line: logEventToString(line)
  });
}

function getStateEvent(tmpEvents: {[key: string]: Event}, end: ?Date): Event {
  const startEvent = tmpEvents[STATE];
  startEvent.end = dateToString(end);
  return startEvent;
}

function returnShellLogLine(line: string): ShellLogLine {
  const ts = parseMongoTs(line);
  if (ts) {
    const components = split(line, ' ', 4);
    return ({ ts: ts, severity: components[1], component: components[2], thread: components[3], message: components[4] });
  }
  return ({ ts: null, severity: null, component: null, thread: null, message: line });
}

function formatMessages(messages: string[]): string[] {
  let curIndent = '';
  const newMessages = [];
  for (let i = 0; i < messages.length; i++) {
    const newMessage = curIndent + messages[i];
    if (newMessage.endsWith('{')) {
      curIndent += ' ';
    } else if (newMessage.endsWith('}')) {
      curIndent = curIndent.substring(2, curIndent.length);
    }
  }
  return newMessages;
}

function makeJSStackTraceEvent(logLines: ShellLogLine[]): LogEvent {
  const stacktrace = [];
  let messages = [];
  let ts = null;

  for (let i = 0; i < logLines.length; i++) {
    const line = logLines[i];
    const message = line.message;
    const match = JS_STACK_REGEX.test(message);
    if (match) {
      stacktrace.unshift(message); // adds to front of array
    } else if (message.trim().length !== 0) {
      messages.unshift(message);
    }
    if (line.ts) {
      ts = line.ts;
      break;
    }
  }
  messages = formatMessages(messages);
  return ({
    type: 'JSStackTraceEvent',
    title: 'Javascript StackTrace',
    ts: ts,
    messages: messages,
    stacktrace: stacktrace
  });
}

function initiateShellLogList(): ShellLogList {
  return ({
    shellLogLines: [],
    fatalStackTrace: null,
    curTs: null,
    startupLogLine: { ts: null, rawTs: 'N/A', severity: 'N/A', logComponent: 'N/A', thread: DEFAULT_THREAD_ID, messages: [] }
  });
}

function appendShellLogList(line: string, sll: ShellLogList) {
  const logLine = returnShellLogLine(line);
  const newMessages = sll.startupLogLine.messages;
  newMessages.push(logLine.message);
  sll.startupLogLine.messages = newMessages;
  if (line.startsWith('failed to load')) {
    sll.fatalStackTrace = makeJSStackTraceEvent(sll.shellLogLines);
  }
  sll.shellLogLines.push(logLine);
  return sll;
}

function handleShellOutput(body: string, sll: ShellLogList, fll: {[key: string]: FixtureLogList}) {
  const shellPrefix = SHELL_LINE_REGEX.exec(body);
  const newFll = fll;
  if (shellPrefix !== null && ['b', 'c', 'd', 's'].includes(shellPrefix[1])) {
    const type = shellPrefix[1];
    const port = shellPrefix[2];
    const procBody = shellPrefix[3];
    if (!newFll[port]) {
      newFll[port] = initiateFixtureLogList();
    }
    const addToFll = appendFixtureLogList(newFll[port], procBody);
    newFll[port] = addToFll;
    if (type === 'c') {
      newFll[port].isConfigsvr = true;
    } else if (type === 's') {
      newFll[port].isMongos = true;
    }
  }
  return ({
    sll: shellPrefix ? sll : appendShellLogList(body, sll),
    fll: newFll
  });
}

function parseTestLog(processed: Processed[]): {[key: string]: FixtureLogList} {
  let fixtureLogLists = {};
  let sll = initiateShellLogList();
  for (let i = 0; i < processed.length; i++) {
    const line = processed[i].text;
    const presplit = presplitLine(line);
    if (!presplit.prefix) {
      continue;
    } else if (presplit.prefix.isShell) {
      const hso = handleShellOutput(presplit.body, sll, fixtureLogLists);
      fixtureLogLists = hso.fll;
      sll = hso.sll;
    } else if (presplit.prefix.isFixture) {
      const prefix = presplit.prefix;
      if (prefix.fixture_id in fixtureLogLists) {
        let modifyBodyList = fixtureLogLists[prefix.fixture_id];
        modifyBodyList = appendFixtureLogList(modifyBodyList, presplit.body);
        fixtureLogLists[prefix.fixture_id] = modifyBodyList;
      } else {
        let newBodyList = initiateFixtureLogList();
        newBodyList = appendFixtureLogList(newBodyList, presplit.body);
        fixtureLogLists[prefix.fixture_id] = newBodyList;
      }
    }
  }
  const keys = fixtureLogLists ? Object.keys(fixtureLogLists) : [];
  if (keys.length > 0) {
    const fixtureIdList = keys;
    for (let j = 0; j < fixtureIdList.length; j++) {
      const fixtureId = fixtureIdList[j];
      const fixtureLogList = fixtureLogLists[fixtureId];
      if (typeof fixtureId !== 'number') {
        fixtureLogList.isResmoke = true;
      }
    }
  }
  return fixtureLogLists;
}

function readTests(processed: Processed[]): Event[] {
  const events = []; // Event[] type
  let tmpEvents = {};
  console.log('Processing test logs');
  const fixtureLogLists = parseTestLog(processed);
  const fixtureIdList = fixtureLogLists ? Object.keys(fixtureLogLists) : [];
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
    events.push(makeEvent(LOG, logList.logStart, logList.logEnd, fixtureId));
    tmpEvents = {};
    let lastTs = null;
    for (let j = 0; j < logList.events.length; j++) {
      const evt = logList.events[j];
      if (evt.ts === null) {
        continue;
      }
      lastTs = evt.ts;
      if (evt.type === 'ServerStartEvent') {
        events.push(makeEvent(SERVER_START, evt.ts, evt.ts, fixtureId));
      } else if (evt.type === 'ServerShutdownStartEvent') {
        events.push(makeEvent(SERVER_SHUTDOWN_START, evt.ts, evt.ts, fixtureId));
      } else if (evt.type === 'ServerShutdownCompleteEvent') {
        events.push(makeEvent(SERVER_SHUTDOWN_COMPLETE, evt.ts, evt.ts, fixtureId));
      } else if (evt.type === 'FixtureFatalEvent') {
        events.push(makeEventWithLine(FATAL, evt.ts, evt.ts, fixtureId, evt));
      } else if (evt.type === 'FixtureErrorEvent') {
        events.push(makeEventWithLine(ERROR, evt.ts, evt.ts, fixtureId, evt));
      } else if (evt.type === 'FixtureWarningEvent') {
        events.push(makeEventWithLine(WARNING, evt.ts, evt.ts, fixtureId, evt));
      } else if (evt.type === 'TransitionEvent') {
        if (Object.keys(tmpEvents).includes(STATE)) {
          // console.log(tmpEvents);
          events.push(getStateEvent(tmpEvents, evt.ts));
          delete tmpEvents[STATE];
        }
        const newEvent = { type: STATE, start: dateToString(evt.ts),
          fixture_id: fixtureId, line: logEventToString(evt), state: evt.state };
        tmpEvents[STATE] = newEvent;
      } else if (evt.type === 'ElectionSuccessEvent') {
        events.push(makeEvent(ELECTION_SUCCESS, evt.ts, evt.ts, fixtureId));
      }
    }
    if (Object.keys(tmpEvents).includes(STATE)) {
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
