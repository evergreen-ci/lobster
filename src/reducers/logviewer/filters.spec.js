import * as actions from "../../actions";
import filters from "./filters";

describe("filters", () => {
  test("add", () => {
    const out = filters([], actions.addFilter("text", true));
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchSnapshot();

    const out2 = filters(out, actions.addFilter("text", false));
    expect(out2).toHaveLength(1);
    expect(out2[0].caseSensitive).toBe(true);
  });

  test("caseSensitive", () => {
    const out = filters(
      filters([], actions.addFilter("text", true)),
      actions.toggleFilterCaseSensitive("text")
    );
    expect(out).toHaveLength(1);
    expect(out[0].caseSensitive).toBe(false);

    const out2 = filters(out, actions.toggleFilterCaseSensitive("text"));
    expect(out2).toHaveLength(1);
    expect(out2[0].caseSensitive).toBe(true);
  });

  test("remove", () => {
    const out = filters([], actions.addFilter("text", true));
    expect(out).toHaveLength(1);

    const out2 = filters(out, actions.removeFilter("text"));
    expect(out2).toHaveLength(0);
  });

  test("inverse", () => {
    const out = filters([], actions.addFilter("text", true));
    expect(out[0].inverse).toBe(false);

    const out2 = filters(out, actions.toggleFilterInverse("text"));
    expect(out2[0].inverse).toBe(true);

    const out3 = filters(out2, actions.toggleFilterInverse("text"));
    expect(out3[0].inverse).toBe(false);
  });

  test("on", () => {
    const out = filters([], actions.addFilter("text", true));
    expect(out[0].on).toBe(true);

    const out2 = filters(out, actions.toggleFilter("text"));
    expect(out2[0].on).toBe(false);

    const out3 = filters(out2, actions.toggleFilter("text"));
    expect(out3[0].on).toBe(true);
  });

  test("load", () => {
    const out = filters(
      [],
      actions.loadInitialFilters([
        {
          text: "doop",
          on: true,
          line: "true",
          caseSensitive: true,
        },
        {
          text: "boop",
          on: true,
          line: "true",
          caseSensitive: true,
        },
      ])
    );
    expect(out).toHaveLength(2);
  });
});
