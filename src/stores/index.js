// @flow strict

// $FlowFixMe
import Reflux from 'reflux';
// $FlowFixMe
import StateMixin from 'reflux-state-mixin';
import Actions from '../actions';
import axios from 'axios';

import { LOGKEEPER_BASE } from '../config';

export type Filter = {
  text: string,
  on: boolean,
  inverse: boolean
}

export type Bookmark = {
  lineNumber: number,
}

export type Line = {
  +lineNumber: number,
  +text: string,
  +port: ?string,
  +gitRef: ?string,
}

export type ColorMap = { [string]: string }

export type Log = {
  +lines: Line[],
  +colorMap: ColorMap
}

const LobsterStore = Reflux.createStore({
  listenables: [Actions],
  mixins: [StateMixin.store],
  // Loads content from server
  loadDataUrl: function(url: string, server: string): void {
    console.log(url, server);
    if (server && url !== '') {
      console.log('server: ' + server);
      console.log('url: ' + url);
      axios.post('http://' + server, {url: url })
        .then((response) => this.processServerResponse(response))
        .catch((error) => console.log(error));
    }
  },

  getInitialState: function(): Log {
    this.loadData = this.loadData.bind(this);
    return {lines: [], colorMap: {}};
  },

  generateLogkeeperUrl: function(buildParam: string, testParam: ?string): string {
    if (!buildParam) {
      return '';
    }
    if (!testParam) {
      return LOGKEEPER_BASE + '/build/' + buildParam + '/all?raw=1';
    }
    return LOGKEEPER_BASE + '/build/' + buildParam + '/test/' + testParam + '?raw=1';
  },

  loadData: function(build: string, test: string, server: ?string): void {
    if (!build) {
      return;
    }
    const logkeeperUrl = this.generateLogkeeperUrl(build, test);
    // default to requesting from the logkeeper url
    if (server) {
      console.log('server: ' + server );
      console.log('url: ' + logkeeperUrl );
      axios.post('http://' + server, {url: logkeeperUrl})
        .then((response) => this.processServerResponse(response))
        .catch((error) => console.log(error));
    } else {
      console.log('logkeeperUrl: ' + logkeeperUrl );
      axios.get(logkeeperUrl)
        .then((response) => this.processServerResponse(response))
        .catch((error) => console.log(error));
    }
  },

  getGitVersion: function(line: string): string | boolean {
    const gitVersionStr = 'git version: ';
    const gitVersionPos = line.indexOf(gitVersionStr);
    if (gitVersionPos !== -1) {
      return line.substr(gitVersionPos + gitVersionStr.length);
    }
    return false;
  },

  getFullGitRef: function(fileLine: ?string, gitVersion: string): ?string {
    if (!fileLine) {
      return null;
    }
    const gitPrefix = 'https://github.com/mongodb/mongo/blob/';
    return gitPrefix + gitVersion + '/' + fileLine;
  },

  processServerResponse: function(response: { +data: string }): void {
    // set the url to the url we requested
    const lines = response.data.split('\n');

    const processed: Line[] = [];
    const gitPrefix = '{githash:';
    const gitPrefixLen = gitPrefix.length + 2;
    let gitVersionStr = 'master';
    const portRegex = / [sdbc](\d{1,5})\|/;
    const stateRegex = /(:shard\d*|:configsvr)?:(initsync|primary|mongos|secondary\d*|node\d*)]/;

    const colorMap = {};

    const colorList = [
      '#5aae61',
      '#c2a5cf',
      '#bf812d',
      '#dfc27d',
      '#2166ac',
      '#8c510a',
      '#1b7837',
      '#74add1',
      '#d6604d',
      '#762a83',
      '#de77ae'
    ];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Only check the git version if we haven't seen it so far.
      if (gitVersionStr === 'master') {
        const gitVersionParse = this.getGitVersion(line);
        if (gitVersionParse) {
          gitVersionStr = gitVersionParse;
        }
      }

      let lineText = line;
      let gitRef = undefined;
      const gitStartIdx = line.indexOf(gitPrefix);
      if (gitStartIdx !== -1) {
        const gitStopIdx = line.indexOf('}', gitStartIdx);
        if (gitStopIdx > gitStartIdx + gitPrefixLen) {
          gitRef = line.substr(gitStartIdx + gitPrefixLen, gitStopIdx - (gitStartIdx + gitPrefixLen) - 1);
          lineText = line.substr(0, gitStartIdx - 1) + line.substr(gitStopIdx + 1);
        }
      }

      const portArray = portRegex.exec(line);
      let port = undefined;
      if (portArray) {
        port = portArray[1];
      } else {
        const stateArray = stateRegex.exec(line);
        if (stateArray) {
          port = stateArray[0];
        }
      }
      if (port && !colorMap[port]) {
        colorMap[port] = colorList[Object.keys(colorMap).length];
      }

      if (gitRef) {
        gitRef = this.getFullGitRef(gitRef, gitVersionStr);
      }

      processed.push({
        lineNumber: i,
        text: lineText,
        port: port,
        gitRef: gitRef
      });
    }

    this.triggerUpdate(processed, colorMap);
  },

  triggerUpdate: function(lines: Line[], colorMap: ColorMap): void {
    this.setState({lines: lines, colorMap: colorMap});
    this.trigger(this.state);
  }
});

export default LobsterStore;
export {LobsterStore};
