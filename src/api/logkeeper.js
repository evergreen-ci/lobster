// @flow strict

import { LOGKEEPER_BASE, NEW_LOGKEEPER_BASE } from "../config";

export async function getLogkeeperBaseURL(buildParam: string, testParam: ?string): string {
  const res = await window.fetch(generateLogkeeperUrl(NEW_LOGKEEPER_BASE, buildParam, testParam));
  return res.ok ? NEW_LOGKEEPER_BASE : LOGKEEPER_BASE;
} 

function generateLogkeeperUrl(base: string, buildParam: string, testParam: ?string): string {
  if (!buildParam) {
    return "";
  }
  if (!testParam) {
    return base + "/build/" + buildParam + "/all?raw=1";
  }
  return (
    base + "/build/" + buildParam + "/test/" + testParam + "?raw=1"
  );
}

export async function fetchLogkeeper(
  build: string,
  test: ?string
): Promise<Response> {
  const baseURL = await getLogkeeperBaseURL(build, test) 
  const req = new Request(generateLogkeeperUrl(baseURL, build, test), { method: "GET" });
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
