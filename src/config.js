// @flow strict

export const isProd: boolean = process.env.NODE_ENV === "production";
export const LOGKEEPER_BASE: string =
  process.env.REACT_APP_LOGKEEPER_BASE || "";
export const EVERGREEN_BASE: string =
  process.env.REACT_APP_EVERGREEN_BASE ||
  (isProd ? "https://evergreen.mongodb.com" : "/evergreen");
