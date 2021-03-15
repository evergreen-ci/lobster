// @flow

import shouldLineMemoizer from "./shouldLineMemoizer";
import { type Line } from "../../models";

let x = 0;
function terrifyingGlobalFunc() {
  return ++x;
}

test("linememo", function () {
  const l: Line[] = [
    {
      lineNumber: 0,
      text: "asd",
      port: null,
      gitRef: null,
    },
    {
      lineNumber: 1,
      text: "asd",
      port: null,
      gitRef: null,
    },
  ];

  const f = shouldLineMemoizer(terrifyingGlobalFunc);
  const f2 = shouldLineMemoizer(terrifyingGlobalFunc);

  expect(f(l[0])).toBe(1);
  expect(x).toBe(1);
  expect(f(l[0])).toBe(1);
  expect(x).toBe(1);

  // shallow compare means this shouldn't call the memoised func
  // eslint-disable-next-line flowtype/no-flow-fix-me-comments
  // $FlowFixMe
  l.text = "something else";
  expect(f(l[0])).toBe(1);
  expect(x).toBe(1);
  expect(f(l[0])).toBe(1);
  expect(x).toBe(1);

  expect(f(l[1])).toBe(2);
  expect(x).toBe(2);
  expect(f(l[1])).toBe(2);
  expect(x).toBe(2);

  // different instances shouldn't interfere
  expect(f2(l[1])).toBe(3);
  expect(x).toBe(3);
});
