import { findJSONObjectsInLine } from "./LogLineText";

describe("EvergreenLogViewer", () => {
  const simpleText =
    '{"std_get_0_envDataEntry":"distmod","std_get_1_envDataEntry":"rhel62"}';
  const complexText =
    '[js_test:backup_restore_rolling] 2020-03-02T08:52:04.781+0000 d20521| {"t":{"$date":"2020-03-02T08:52:04.780+0000"},"s":"I", "c":"RECOVERY","id":23987,"ctx":"initandlisten","msg":"WiredTiger recoveryTimestamp. Ts: {recoveryTimestamp}","attr":{"recoveryTimestamp":{"$timestamp":{"t":0,"i":0}}}}and then some more text{"std_get_0_envDataEntry":"distmod","std_get_1_envDataEntry":"rhel62"}';

  test("pretty-print-test", () => {
    const simpleTextExpected = [
      JSON.stringify(JSON.parse(simpleText), null, 2).replace(
        /"([^"]+)":/g,
        "$1:"
      ),
    ];
    const simpleTextActual = findJSONObjectsInLine(simpleText);

    const complexTextExpected = [
      "[js_test:backup_restore_rolling] 2020-03-02T08:52:04.781+0000 d20521| ",
      "\n" +
        JSON.stringify(
          JSON.parse(complexText.substring(70, 293)),
          null,
          2
        ).replace(/"([^"]+)":/g, "$1:") +
        "\n",
      "and then some more text",
      "\n" +
        JSON.stringify(JSON.parse(simpleText), null, 2).replace(
          /"([^"]+)":/g,
          "$1:"
        ),
    ];
    const complexTextActual = findJSONObjectsInLine(complexText);

    expect(simpleTextActual).toEqual(simpleTextExpected);
    expect(complexTextActual).toEqual(complexTextExpected);
  });
});
