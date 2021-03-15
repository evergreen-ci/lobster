import React from "react";
import Enzyme from "enzyme";
import { CacheModal } from "./CacheModal";
import sinon from "sinon";

describe("CacheModal", function () {
  test("show", function () {
    const fakes = {
      save: sinon.fake(),
      never: sinon.fake(),
      later: sinon.fake(),
    };
    const wrapper = Enzyme.mount(<CacheModal show={true} {...fakes} />);

    expect(wrapper.contains(<label>{wrapper.state("value")} MiB</label>)).toBe(
      true
    );

    let count = 0;
    for (let i = 0; i < 3; ++i) {
      const button = wrapper.find("Button").at(i);
      const txt = button.prop("children");
      if (txt === "Never") {
        button.simulate("click", {});
        expect(fakes.never.callCount).toBe(1);
        count += 1;
      }
      if (txt === "Yes") {
        button.simulate("click", {});
        expect(fakes.save.callCount).toBe(1);
        count += 1;
      }
      if (txt === "Not Now") {
        button.simulate("click", {});
        expect(fakes.later.callCount).toBe(1);
        count += 1;
      }
    }
    expect(count).toBe(3);
  });
});
