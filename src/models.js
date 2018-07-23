// @flow strict

export type Line = {
  +lineNumber: number,
  +text: string,
  +port: ?string,
  +gitRef: ?string,
}

export type ColorMap = { [string]: string }

export type Log = {|
  +lines: Line[],
  +colorMap: ColorMap,
  +isDone: boolean
|}

export type MongoLine = {|
  +ts: Date,
  +rawTs: string,
  +severity: string,
  +logcomponent: string,
  +thread: string,
  +message: String[]
|}

export type Event = {|
  +type: string,
  +start: string,
  +end?: string,
  +fixtureId?: string,
  +line?: MongoLine
|}

export type LogEvent = {|
  +type: string,
  +title: string,
  +ts: Date,
  +messages: String[],
  +st: String[],
  +logLine: MongoLine,
  +port?: string,
  +pid?: string,
  +signal?: string,
  +signalStr?: string,
  +config?: string,
  +state?: string,
  +startEvent?: ?LogEvent, // of type ElectionStartEvent, should not enter infinite loop
  +voteEvents?: LogEvent[], // list of LogEvents that are of type ElectionVoteEvent
  +node?: string,
  +time?: string,
  +requestId?: string
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
  +logEnd: Date
|}
