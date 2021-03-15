import React from "react";
import Enzyme from "enzyme";
import { LogDrop } from ".";
import sinon from "sinon";

describe("LogDrop", function () {
  test("default", function () {
    const process = sinon.fake();
    const wrapper = Enzyme.mount(<LogDrop processLog={process} />);

    expect(wrapper.contains(<select />)).toBe(false);
  });

  test("drop", function () {
    const process = sinon.fake();
    const history = sinon.fake();
    const wrapper = Enzyme.mount(
      <LogDrop processLog={process} history={history} />
    );

    const f = new File(["line0\nline1\n"], "log.log");
    wrapper.instance().drop({
      preventDefault: sinon.fake(),
      type: "drop",
      dataTransfer: {
        files: [f],
      },
    });

    expect(wrapper.state("files")).toHaveLength(1);
    expect(wrapper.state("files")[0]).toBe(f);
    expect(wrapper.state("processing")).toBe(false);
    expect(wrapper.state("error")).toBe(null);
    expect(process.callCount).toBe(0);

    wrapper.instance().upload();
    expect(wrapper.state("files")).toHaveLength(1);
    expect(wrapper.state("files")[0]).toBe(f);
    expect(wrapper.state("processing")).toBe(true);
    expect(wrapper.state("error")).toBe(null);
  });
});
