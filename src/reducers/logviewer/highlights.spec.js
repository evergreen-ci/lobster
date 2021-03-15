import * as actions from "../../actions";
import highlights from "./highlights";

describe("highlights", () => {
  test("add", () => {
    const out = highlights([], actions.addHighlight("text", true));
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchSnapshot();

    const out2 = highlights(out, actions.addHighlight("text", false));
    expect(out2).toHaveLength(1);
    expect(out2[0].caseSensitive).toBe(true);
  });

  test("caseSensitive", () => {
    const out = highlights(
      highlights([], actions.addHighlight("text", true)),
      actions.toggleHighlightCaseSensitive("text")
    );
    expect(out).toHaveLength(1);
    expect(out[0].caseSensitive).toBe(false);

    const out2 = highlights(out, actions.toggleHighlightCaseSensitive("text"));
    expect(out2).toHaveLength(1);
    expect(out2[0].caseSensitive).toBe(true);
  });

  test("remove", () => {
    const out = highlights([], actions.addHighlight("text", true));
    expect(out).toHaveLength(1);

    const out2 = highlights(out, actions.removeHighlight("text"));
    expect(out2).toHaveLength(0);
  });

  test("line", () => {
    const out = highlights([], actions.addHighlight("text", true));
    expect(out[0].line).toBe(false);

    const out2 = highlights(out, actions.toggleHighlightLine("text"));
    expect(out2[0].line).toBe(true);

    const out3 = highlights(out2, actions.toggleHighlightLine("text"));
    expect(out3[0].line).toBe(false);
  });

  test("on", () => {
    const out = highlights([], actions.addHighlight("text", true));
    expect(out[0].on).toBe(true);

    const out2 = highlights(out, actions.toggleHighlight("text"));
    expect(out2[0].on).toBe(false);

    const out3 = highlights(out2, actions.toggleHighlight("text"));
    expect(out3[0].on).toBe(true);
  });

  test("load", () => {
    const out = highlights(
      [],
      actions.loadInitialHighlights([
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
