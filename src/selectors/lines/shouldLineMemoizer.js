// @flow strict

import type { Line } from '../../models';

/* eslint-disable flowtype/no-flow-fix-me-comments,flowtype/no-weak-types */

// $FlowFixMe
function defaultEqualityCheck(a, b) {
  return a === b;
}

// $FlowFixMe
function areArgumentsShallowlyEqual(equalityCheck: (a: any, b: any) => boolean, prev: any, next: any) {
  if (prev === null || next === null || prev.length !== next.length) {
    return false;
  }

  // Do this in a for loop (and not a `forEach` or an `every`) so we can determine equality as fast as possible.
  const length = prev.length;
  for (let i = 0; i < length; i++) {
    if (!equalityCheck(prev[i], next[i])) {
      return false;
    }
  }

  return true;
}

// $FlowFixMe
export default function(func: Function, equalityCheck: (a: any, b: any) => boolean = defaultEqualityCheck) {
  // $FlowFixMe
  const m: Map<number, [Object, any]> = new Map();

  // we reference arguments instead of spreading them for performance reasons
  // $FlowFixMe
  return function(_line: Line, ..._args: any) {
    const lineNum = arguments[0].lineNumber;
    let result = m.get(lineNum);

    if (result == null || !areArgumentsShallowlyEqual(equalityCheck, result[0], arguments)) {
      // apply arguments instead of spreading for performance.
      result = [arguments, func.apply(null, arguments)];
      m.set(lineNum, result);
    }

    return result[1];
  };
}
