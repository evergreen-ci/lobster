// @flow strict

export type Line = $Exact<$ReadOnly<{
  lineNumber: number,
  text: string,
  port: ?string,
  gitRef: ?string,
}>>

export type ColorMap = $ReadOnly<{ [string]: string }>

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
  isDone: boolean
}>>

