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

export type Event = {|
  +type: string,
  +start: string,
  +end: string
|}

export type MongoLine = {|
  +ts: Date,
  +rawTs: string,
  +severity: string,
  +logcomponent: string,
  +thread: string,
  +message: String[]
|}

export type FixtureLogList = {|
  +isResmoke: boolean,
  +isConfigsvr: boolean,
  +isMongos: boolean,
  +isShard: boolean,
  +isMongoProcess: boolean,
  +curThread: string,
  +curLogLine: MongoLine,
  +events: Event[],
  +currentElectionVoteEvent: Event[], // EletionVoteEvent[]
  +currentElectionStartEvent: Event, // ElectionStartEvent
  +logStart: Date,
  +logEnd: Date
|}

export type LogEvent = {|
  +type: string,
  +title: string,
  +ts: Date,
  +messages: String[],
  +st: String[]
|}
