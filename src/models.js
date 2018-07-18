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
