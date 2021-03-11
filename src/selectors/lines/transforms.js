// @flow strict

import type { ResmokeLog } from "src/models";

export function parseLogLine(line: string): string {
  let logParts = line.split("|"); // in many cases mongod will insert a pipe between the metadata and json logs
  if (logParts.length !== 2) {
    const startOfJson = line.indexOf("{"); // if not, attempt to find the first occurence of a json document and attempt to parse as a log
    if (startOfJson > -1) {
      logParts = [line.substring(0, startOfJson), line.substring(startOfJson)];
    } else {
      return line;
    }
  }
  const structedLog = parseMongoJson(logParts[1]);
  if (structedLog === null) {
    return line;
  }
  return `${logParts[0]}| ${structedLog.t.$date} ${structedLog.s.padEnd(
    2
  )} ${structedLog.c.padEnd(8)} ${structedLog.id.toString().padEnd(7)} [${
    structedLog.ctx
  }] ${JSON.stringify(structedLog.msg)}${
    structedLog.attr ? ',"attr":' + JSON.stringify(structedLog.attr) : ""
  }${
    structedLog.truncated
      ? ',"truncated":' + JSON.stringify(structedLog.truncated)
      : ""
  }${structedLog.size ? ',"size":' + JSON.stringify(structedLog.size) : ""}`;
}

function parseMongoJson(toParse: string): ResmokeLog | null {
  let log: ResmokeLog;
  try {
    log = JSON.parse(toParse);
  } catch (err) {
    return null;
  }
  if (log.c && log.s && log.id) {
    return log;
  }
  return null;
}
