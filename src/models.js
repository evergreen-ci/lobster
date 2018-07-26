// @flow strict

export type Line = $Exact<$ReadOnly<{
  +lineNumber: number,
  +text: string,
  +port: ?string,
  +gitRef: ?string,
}>>

export type ColorMap = $ReadOnly<{ [string]: string }>

export type MongoLine = {|
  +ts: Date,
  +rawTs: string,
  +severity: string,
  +logcomponent: string,
  +thread: string,
  +messages: string[]
|}

export type Event = {|
  +type: string,
  +start: string,
  +end?: string,
  +fixture_id?: string,
  +line?: MongoLine,
  +state?: string
|}

export type LogEvent = {|
  +type: string,
  +title: string,
  +ts: Date,
  +messages: string[],
  +st: string[],
  +logLine?: MongoLine,
  +port?: string,
  +pid?: string,
  +signal?: string,
  +signalStr?: string,
  +config?: string,
  +state?: string,
  +initialState?: string,
  +startEvent?: ?LogEvent, // of type ElectionStartEvent, should not enter infinite loop
  +voteEvents?: LogEvent[], // list of LogEvents that are of type ElectionVoteEvent
  +node?: string,
  +time?: string,
  +requestId?: string,
  +stacktrace?: string[]
|}

export type FixtureLogList = {|
  +isResmoke: boolean,
  +isConfigsvr: boolean,
  +isMongos: boolean,
  +isShard: boolean,
  +isMongoProcess: boolean,
  +curThread: string,
  +curLogLine: MongoLine,
  +events: LogEvent[],
  +currentElectionVoteEvents: LogEvent[], // EletionVoteEvent[]
  +currentElectionStartEvent: ?LogEvent, // ElectionStartEvent
  +logStart: Date,
  +logEnd: Date,
  +logLines: {string: MongoLine[]}
|}

export type ShellLogLine = {|
  +ts: Date,
  +severity: string,
  +component: string,
  +thread: string,
  +message: string
|}

export type ShellLogList = {|
  +shellLogLines: ShellLogLine[],
  +fatalStackTrace: LogEvent, // type JSStackTraceEvent
  +curTs: Date,
  +parallelSuiteEvent: LogEvent, // type ParallelSuiteErrorEvent
  +jsStackTraceClass: string,
  +startupLogLine: MongoLine
|}

const logTypes_ = {
  'resmoke': '',
  'raw': ''
};

export const logTypes = (): string[] => Object.keys(logTypes_);

export type LogType = $Keys<typeof logTypes_>

export type Log = $Exact<$ReadOnly<{
  lines: Line[],
  colorMap: ColorMap,
  isDone: boolean
}>>
