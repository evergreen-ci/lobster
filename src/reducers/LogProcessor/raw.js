// @flow strict

import type { Log } from '../../models';

export default function(delimiter: string) {
  return function(state: Log, response: string): Log {
    let lines = response.split(delimiter);
    if (lines.length > 0 && lines[lines.length - 1] === '') {
      lines = lines.slice(0, lines.length - 1);
    }

    return {
      identity: state.identity,
      lines: lines.map((line, index) => {
        return {
          lineNumber: index,
          text: line,
          port: null,
          gitRef: null
        };
      }),
      colorMap: {},
      isDone: true
    };
  };
}
