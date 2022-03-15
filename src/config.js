// @flow strict

export const isProd: boolean = process.env.NODE_ENV === 'production';
export const LOGKEEPER_BASE: string =
  process.env.REACT_APP_LOGKEEPER_BASE || 'https://logkeeper.mongodb.org';
export const EVERGREEN_BASE: string =
  process.env.REACT_APP_EVERGREEN_BASE || '';
 export const SPRUCE_BASE: string =
  process.env.REACT_APP_SPRUCE_BASE || 'https://spruce.mongodb.com';

