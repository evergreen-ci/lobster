// @flow strict

import reducer from "./processData";
import { processData, processDataError } from "../actions";

describe("log", function () {
  test("store-line-gitref", function () {
    const data = ["line0", "line1"];

    const state = reducer(undefined, processData(data.join("\n"), "resmoke"));

    expect(state.lines).toHaveLength(2);
    expect(Object.keys(state.colorMap)).toHaveLength(0);
  });

  test("logkeeperDataResponse-error", function () {
    const action = processDataError("error");
    const state = reducer(undefined, action);
    expect(state.lines).toHaveLength(0);
    expect(state.colorMap.size).toBe(0);
  });
});
