import Reflux from 'reflux';
import StateMixin from 'reflux-state-mixin';
import Actions from '../actions';
import axios from 'axios';


const LobsterStore =  Reflux.createStore ({
  LOGKEEPER_BASE: process.env.REACT_APP_LOGKEEPER_BASE || '', // eslint-disable-line no-undef
  listenables: [Actions],
  mixins: [StateMixin.store],
  // Loads content from server
  loadDataUrl: function(url, server){
    if(server && url != ""){
      console.log("server: " + server );
      console.log("url: " + url );
      axios.post("http://" + server, {url: url })
      .then((response) => this.processServerResponse(response))
      .catch((error) => console.log(error));
    }
  },

  getInitialState: function(){
    this.loadData = this.loadData.bind(this);
    return {lines: [], colorMap: {}};

  },

  generateLogkeeperUrl: function(buildParam, testParam){
    if(!buildParam){
      return "";
    }
    if(!testParam){
      return this.LOGKEEPER_BASE + "/build/" + buildParam + "/all?raw=1";
    }
    return this.LOGKEEPER_BASE + "/build/" + buildParam + "/test/" + testParam + "?raw=1";
  },

  loadData: function(build, test, server){
    if(!build){
      return;
    }
    let logkeeperUrl = this.generateLogkeeperUrl(build, test);
    // default to requesting from the logkeeper url
    if(server){
      console.log("server: " + server );
      console.log("url: " + logkeeperUrl );
      axios.post("http://" + server, {url: logkeeperUrl})
      .then((response) => this.processServerResponse(response))
      .catch((error) => console.log(error));
    }
    else {
      console.log("logkeeperUrl: " + logkeeperUrl );
      axios.get(logkeeperUrl)
      .then((response) => this.processServerResponse(response))
      .catch((error) => console.log(error));
    }
  },

  getGitVersion: function(line){
    const gitVersionStr = "git version: ";
    let gitVersionPos = line.indexOf(gitVersionStr);
    if (gitVersionPos !== -1) {
      return line.substr(gitVersionPos + gitVersionStr.length);
    }
    return false;
  },

  getFullGitRef: function(fileLine, gitVersion) {
    if(!fileLine) {
      return null;
    }
    const gitPrefix = "https://github.com/mongodb/mongo/blob/";
    return gitPrefix + gitVersion + "/" + fileLine;
  },

  processServerResponse: function(response){
    // set the url to the url we requested
    let lines = response.data.split('\n');

    let processed = [];
    const gitPrefix = "{githash:";
    const gitPrefixLen = gitPrefix.length + 2;
    let gitVersionStr = "master";
    const portRegex = / [sdbc](\d{1,5})\|/;
    const stateRegex = /:(initsync|primary|secondary\d*|node\d*)]/;

    let colorMap = {};

    const colorList = ["seagreen", "steelblue",
    "mediumpurple", "crimson", "darkkhaki",
    "darkgreen", "rosybrown", "chocolate",
    "orangered", "darkseagreen", "royalblue",
    "slategray",];

    for (let i=0; i < lines.length; i++) {
      const line = lines[i];
      let lineObj = {lineNumber: i};

      // Only check the git version if we haven't seen it so far.
      if (gitVersionStr === "master") {
        let gitVersionParse = this.getGitVersion(line);
        if (gitVersionParse) {
          gitVersionStr = gitVersionParse;
        }
      }

      const gitStartIdx = line.indexOf(gitPrefix);
      if (gitStartIdx !== -1) {
        const gitStopIdx = line.indexOf("}", gitStartIdx);
        if (gitStopIdx > gitStartIdx + gitPrefixLen) {
          const fileLine = line.substr(gitStartIdx+gitPrefixLen, gitStopIdx-(gitStartIdx+gitPrefixLen)-1);
          const textLine = line.substr(0, gitStartIdx-1) + line.substr(gitStopIdx+1);
          lineObj['text'] = textLine;
          lineObj['gitRef'] = fileLine;
        }
      } else {
        lineObj['text'] = line;
      }

      const portArray = portRegex.exec(line);
      if (portArray && portArray[0]) {
        let port = portArray[1];
        lineObj['port'] = port;

        if(!colorMap[port]) {
          colorMap[port] = colorList[Object.keys(colorMap).length];
        }
      } else {
        const stateArray = stateRegex.exec(line);
        if(stateArray && stateArray[0]) {
          let port = stateArray[1];
          lineObj['port'] = port;

          if(!colorMap[port]) {
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
