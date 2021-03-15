// @flow strict

/* eslint-disable flowtype/no-flow-fix-me-comments,flowtype/no-weak-types */

// Taken from underscore.js; vendored to avoid importing it
// https://github.com/jashkenas/underscore/blob/d5fe0fd4060f13b40608cb9d92eda6d857e8752c/underscore.js
// $FlowFixMe
const restArguments = function (func: Function, startIndex) {
  // $FlowFixMe
  startIndex = startIndex == null ? func.length - 1 : +startIndex; // eslint-disable-line
  return function () {
    // $FlowFixMe
    const length = Math.max(arguments.length - startIndex, 0);

    const rest = Array(length);

    let index = 0;
    for (; index < length; index++) {
      rest[index] = arguments[index + startIndex];
    }
    switch (startIndex) {
      case 0:
        return func.call(this, rest);
      case 1:
        return func.call(this, arguments[0], rest);
      case 2:
        return func.call(this, arguments[0], arguments[1], rest);
      // no default
    }
    const args = Array(startIndex + 1);
    // $FlowFixMe
    for (index = 0; index < startIndex; index++) {
      args[index] = arguments[index];
    }
    // $FlowFixMe
    args[startIndex] = rest;
    return func.apply(this, args);
  };
};

const delay = restArguments(function (func, wait, args) {
  return setTimeout(function () {
    return func.apply(null, args);
  }, wait);
});

export default function (func: () => void, wait: number, immediate?: boolean) {
  let timeout: ?TimeoutID;
  let result;

  const later = function (context, args) {
    timeout = null;
    if (args) result = func.apply(context, args);
  };

  const debounced = restArguments(function (args) {
    if (timeout) clearTimeout(timeout);
    if (immediate === true) {
      const callNow = !timeout;
      timeout = setTimeout(later, wait);
      if (callNow) result = func.apply(this, args);
    } else {
      // $FlowFixMe
      timeout = delay(later, wait, this, args);
    }

    return result;
  });

  debounced.cancel = function () {
    if (timeout != null) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced;
}
