declare module 'query-string' {
  declare export function extract(input: string): string[]

  declare export type ArrayFormat = 'none' | 'bracket' | 'index';
  declare export type ParseOptions = {
    decode: boolean,
		arrayFormat: ArrayFormat
  };
  declare export type Parameters = {
    [string]: string
  }
  declare export function parse(input: string, options?: ParseOptions): Parameters

  declare export type StringifyOptions = {
		encode: boolean,
		strict: boolean,
    sort: boolean,
		arrayFormat: 'none' | 'bracket' | 'index'
  };
  declare export function stringify(obj: Parameters, options?: StringifyOptions): Object

  declare export type ParseResult = {
    url: string,
    query: Object
  }
  declare export function parseUrl(input: string, options?: ParseOptions): ParseResult
}
