import Reflux from 'reflux';
import StateMixin from 'reflux-state-mixin';
import Actions from '../actions';
import axios from 'axios';

import { LOGKEEPER_BASE } from '../config';

const LobsterStore = Reflux.createStore({
  listenables: [Actions],
  mixins: [StateMixin.store],
  // Loads content from server
  loadDataUrl: function(url, server) {
    if (server && url !== '') {
      console.log('server: ' + server );
      console.log('url: ' + url );
      axios.post('http://' + server, {url: url })
        .then((response) => this.processServerResponse(response))
        .catch((error) => console.log(error));
    }
  },

  getInitialState: function() {
    this.loadData = this.loadData.bind(this);
    return {lines: [], colorMap: {}};
  },

  generateLogkeeperUrl: function(buildParam, testParam) {
    if (!buildParam) {
      return '';
    }
    if (!testParam) {
      return LOGKEEPER_BASE + '/build/' + buildParam + '/all?raw=1';
    }
    return LOGKEEPER_BASE + '/build/' + buildParam + '/test/' + testParam + '?raw=1';
  },

  loadData: function(build, test, server) {
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

  getGitVersion: function(line) {
    const gitVersionStr = 'git version: ';
    const gitVersionPos = line.indexOf(gitVersionStr);
    if (gitVersionPos !== -1) {
      return line.substr(gitVersionPos + gitVersionStr.length);
    }
    return false;
  },

  getFullGitRef: function(fileLine, gitVersion) {
    if (!fileLine) {
      return null;
    }
    const gitPrefix = 'https://github.com/mongodb/mongo/blob/';
    return gitPrefix + gitVersion + '/' + fileLine;
  },

  processServerResponse: function(response) {
    // set the url to the url we requested
    const lines = response.data.split('\n');

    const processed = [];
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
      const lineObj = {lineNumber: i};

      // Only check the git version if we haven't seen it so far.
      if (gitVersionStr === 'master') {
        const gitVersionParse = this.getGitVersion(line);
        if (gitVersionParse) {
          gitVersionStr = gitVersionParse;
        }
      }

      const gitStartIdx = line.indexOf(gitPrefix);
      if (gitStartIdx !== -1) {
        const gitStopIdx = line.indexOf('}', gitStartIdx);
        if (gitStopIdx > gitStartIdx + gitPrefixLen) {
          const fileLine = line.substr(gitStartIdx + gitPrefixLen, gitStopIdx - (gitStartIdx + gitPrefixLen) - 1);
          const textLine = line.substr(0, gitStartIdx - 1) + line.substr(gitStopIdx + 1);
          lineObj.text = textLine;
          lineObj.gitRef = fileLine;
        }
      } else {
        lineObj.text = line;
      }

      const portArray = portRegex.exec(line);
      if (portArray) {
        const port = portArray[1];
        lineObj.port = port;

        if (!colorMap[port]) {
          colorMap[port] = colorList[Object.keys(colorMap).length];
        }
      } else {
        const stateArray = stateRegex.exec(line);
        if (stateArray) {
          const port = stateArray[0];
          lineObj.port = port;

          if (!colorMap[port]) {
            colorMap[port] = colorList[Object.keys(colorMap).length];
          }
        }
      }


      if (lineObj.gitRef) {
        lineObj.gitRef = this.getFullGitRef(lineObj.gitRef, gitVersionStr);
      }
      processed.push(lineObj);
    }

    this.triggerUpdate(processed, colorMap);
  },

  triggerUpdate: function(lines, colorMap) {
    this.setState({lines: lines, colorMap: colorMap});
    this.trigger(this.state);
  }
});

export default LobsterStore;
export {LobsterStore};
