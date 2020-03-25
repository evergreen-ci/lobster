// flow-typed signature: 9f57ccf833994513ca8c186a283871cf
// flow-typed version: <<STUB>>/lossless-json_v^1.0.3/flow_v0.78.0

declare type losslessJson = {
  parse: (any) => Object,
  stringify: (any) => string,
}

declare module 'lossless-json' {
  declare module.exports: losslessJson;
}