// @flow strict

export type Line = $Exact<$ReadOnly<{
  lineNumber: number,
  text: string,
  port: ?string,
  gitRef: ?string,
}>>

export type ColorMap = $ReadOnly<{ [string]: string }>

export type Settings = $ReadOnly<$Exact<{
  wrap: boolean,
  caseSensitive: boolean,
  filterIntersection: boolean
}>>

export type Bookmark = {|
  lineNumber: number,
  scrollFunc?: (SyntheticMouseEvent<HTMLInputElement>) => void
|}

export type Filter = $Exact<$ReadOnly<{
  text: string,
  on: boolean,
  inverse: boolean
}>>

export type Highlight = $Exact<$ReadOnly<{
  text: string,
  on: boolean,
  line: boolean
}>>

export type MongoLine = {|
  +ts: ?Date,
  +rawTs: string,
  +severity: string,
  +logComponent: string,
  +thread: string,
  messages: string[]
|}

export type Event = {|
  +type: string,
  start: string,
  end?: string,
  +fixture_id?: string,
  +line?: string,
  +state?: string
|}

export type LogEvent = {|
  type: string,
  +title: string,
  ts: ?Date,
  messages: string[],
  logLine?: MongoLine,
  port?: string,
  pid?: string,
  signal?: string,
  signalStr?: string,
  config?: string,
  state?: string,
  initialState?: string,
  startEvent?: ?LogEvent, // of type ElectionStartEvent, should not enter infinite loop
  voteEvents?: LogEvent[], // list of LogEvents that are of type ElectionVoteEvent
  node?: string,
  time?: string,
  requestId?: string,
  +stacktrace?: string[]
|}

export type Prefix = {|
  +prefixes: string[],
  +jobNum: string,
  +isFixture: boolean,
  +isShell: boolean,
  +fixture_id: string
|}

export type Processed = {|
  +lineNumber: number,
  +text: string,
  +port: ?string,
  +gitRef: ?string
|}

export type ElectionUpdate = {|
  +currentElectionStartEvent: ?LogEvent,
  +currentElectionVoteEvents: ?LogEvent[],
  +evt: LogEvent
|}

export type FixtureLogList = {|
  isResmoke: boolean,
  isConfigsvr: boolean,
  isMongos: boolean,
  +isShard: boolean,
  +isMongoProcess: boolean,
  curThread: string,
  curLogLine: ?MongoLine,
  events: LogEvent[],
  currentElectionVoteEvents: ?LogEvent[], // EletionVoteEvent[]
  currentElectionStartEvent: ?LogEvent, // ElectionStartEvent
  logStart: ?Date,
  logEnd: ?Date,
  +logLines: {[key: string]: MongoLine[]}
|}

export type ShellLogLine = {|
  +ts: ?Date,
  +severity: ?string,
  +component: ?string,
  +thread: ?string,
  +message: string
|}

export type ShellLogList = {|
  +shellLogLines: ShellLogLine[],
  fatalStackTrace: ?LogEvent, // type JSStackTraceEvent
  +curTs: ?Date,
  +parallelSuiteEvent?: LogEvent, // type ParallelSuiteErrorEvent
  +jsStackTraceClass?: string,
  +startupLogLine: MongoLine
|}

const logProcessors_ = {
  'resmoke': '',
  'raw': ''
};

export const logProcessors = (): string[] => Object.keys(logProcessors_);

export type LogProcessor = $Keys<typeof logProcessors_>

const evergreenTaskLogTypes: { [string]: string } = {
  'all': 'ALL',
  'task': 'T',
  'agent': 'A',
  'system': 'S'
  // 'event': 'E' // Not actually supported by the api
};

export type EvergreenTaskLogType = $Keys<typeof evergreenTaskLogTypes>;

export function stringToInteralEvergreenTaskLogType(a: ?string): ?string {
  if (a == null) {
    return null;
  }
  return evergreenTaskLogTypes[a];
}

export function stringToEvergreenTaskLogType(a: ?string): ?EvergreenTaskLogType {
  if (a == null || !(a in evergreenTaskLogTypes)) {
    return null;
  }

  return a;
}

export type EvergreenTaskLog = $ReadOnly<{
  type: 'evergreen-task',
  id: string,
  execution: number,
  log: EvergreenTaskLogType
}>

export type EvergreenTestLog = $ReadOnly<{
  type: 'evergreen-test',
  id: string
}>

export type EvergreenLog = EvergreenTaskLog
  | EvergreenTestLog

export type LobsterLog = $ReadOnly<{
  type: 'lobster',
  server: string,
  file: string
}>

export type LogkeeperLog = $ReadOnly<{
  type: 'logkeeper',
  build: string,
  test?: string
}>

export type LogIdentity = LogkeeperLog
  | LobsterLog
  | EvergreenLog

export type Log = $Exact<$ReadOnly<{
  identity: ?LogIdentity,
  lines: Line[],
  colorMap: ColorMap,
  isDone: boolean,
  events: Event[]
}>>

export type Find = $Exact<$ReadOnly<{
  findIdx: number,
  searchTerm: string
}>>

export type Logviewer = $Exact<$ReadOnly<{
  filters: Filter[],
  highlights: Highlight[],
  bookmarks: Bookmark[],
  find: Find,
  settings: Settings,
}>>

export type VisualLineData = $Exact<$ReadOnly<{
  filteredLines: Line[],
  indexMap: Map<number, number>,
  highlights: Set<number>
}>>

export type LineData = $Exact<$ReadOnly<{
  indexMap: Map<number, number>,
  findResults: number[],
  filteredLines: Line[],
  highlightLines: Line[],
  highlightText: string[]
}>>

export type CacheStatus = 'ok' | 'error' | 'never' | 'later' | 'unsupported' | null;

export type CacheState = $Exact<$ReadOnly<{
  status: CacheStatus,
  size: number
}>>

export type LogViewerState = $Exact<$ReadOnly<{
  filters: Filter[],
  highlights: Highlight[],
  bookmarks: Bookmark[],
  find: Find,
  settings: Settings,
  settingsPanel: boolean
}>>

export type ReduxState = $Exact<$ReadOnly<{
  cache: CacheState,
  log: Log,
  logviewer: LogViewerState
}>>
