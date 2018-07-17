// @flow strict

import type { Log } from '../../actions';

export default function(response: string): Log {
  // set the url to the url we requested
  const lines = response.split('\n');
  console.log(lines);

  return {
    lines: [],
    colorMap: {}
  };
}
