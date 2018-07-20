// @flow strict

export type Line = $Exact<$ReadOnly<{
  +lineNumber: number,
  +text: string,
  +port: ?string,
  +gitRef: ?string,
}>>

export type ColorMap = { [string]: string }

const logTypes_ = {
  'resmoke': '',
  'raw': ''
};

export const logTypes = (): string[] => Object.keys(logTypes_);

export type LogType = $Keys<typeof logTypes_>

export type Log = $Exact<$ReadOnly<{
  +lines: Line[],
  +colorMap: ColorMap,
  +isDone: boolean
}>>
