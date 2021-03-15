// @flow strict

import { LOGKEEPER_BASE } from "../config";

function generateLogkeeperUrl(buildParam: string, testParam: ?string): string {
  if (!buildParam) {
    return "";
  }
  if (!testParam) {
    return LOGKEEPER_BASE + "/build/" + buildParam + "/all?raw=1";
  }
  return (
    LOGKEEPER_BASE + "/build/" + buildParam + "/test/" + testParam + "?raw=1"
  );
}

export function fetchLogkeeper(
  build: string,
  test: ?string
): Promise<Response> {
  const req = new Request(generateLogkeeperUrl(build, test), { method: "GET" });
  return window.fetch(req);
}

export function fetchLobster(server: string, url: string): Promise<Response> {
  const init = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url: url,
    }),
  };
  const req = new Request(`http://${server}`, init);
  return window.fetch(req);
}
