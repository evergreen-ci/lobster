// @flow strict
import axios from 'axios';
import { LOGKEEPER_BASE } from '../config';

function generateLogkeeperUrl(buildParam: string, testParam: ?string): string {
  if (!buildParam) {
    return '';
  }
  if (!testParam) {
    return LOGKEEPER_BASE + '/build/' + buildParam + '/all?raw=1';
  }
  return LOGKEEPER_BASE + '/build/' + buildParam + '/test/' + testParam + '?raw=1';
}


export function fetchLogkeeper(build: string, test: ?string) {
  return axios.get(generateLogkeeperUrl(build, test));
}
