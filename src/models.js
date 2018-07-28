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

export type Log = $Exact<$ReadOnly<{
  lines: Line[],
  colorMap: ColorMap,
  isDone: boolean
}>>

const evergreenTaskLogTypes: { [string]: string } = {
  'all': 'ALL',
  'task': 'T',
  'agent': 'A',
  'system': 'S'
  // 'event': 'E' // Not actually supported by the api
};

export type EvergreenTaskLogType = $Keys<typeof evergreenTaskLogTypes>;

export function stringToInteralEvergreenTaskLogType(a: string): ?string {
  return evergreenTaskLogTypes[a];
}

export function stringToEvergreenTaskLogType(a: string): ?EvergreenTaskLogType {
  if (!evergreenTaskLogTypes[a]) {
    return null;
  }

  return a;
}

export type EvergreenTaskLog = $Exact<$ReadOnly<{
  type: 'task',
  id: string,
  execution: number,
  log: EvergreenTaskLogType
}>>

export type EvergreenTestLog = $Exact<$ReadOnly<{
  type: 'test',
  id: string
}>>

export type LobsterServer = $Exact<$ReadOnly<{
  server: string,
  file: string
}>>

export type LogkeeperLog = $Exact<$ReadOnly<{
  type: 'logkeeper',
  build: string,
  test?: string,
  lobsterServer?: LobsterServer
}>>

export type LogIdentity = LogkeeperLog
  | EvergreenTaskLog
  | EvergreenTestLog
