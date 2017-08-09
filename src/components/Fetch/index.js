import React from 'react';
import axios from 'axios';
import LogView from '../LogView/index.js';

import './style.css';

class Fetch extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          url: 'http://', 
          filter: '',
          data: [],
          /*
          data: [
            {line: '[js_test:after_cluster_time] 2017-07-27T23:32:53.172+0000 d22010| 2017-07-27T23:32:53.169+0000 I NETWORK  [conn8] end connection 10.158.195.82:50080 (14 connections now open)', 
             gitRef: 'https://github.com/mongodb/mongo/blob/master/src/mongo/s/chunk.cpp#L39'},
            {line: '[js_test:after_cluster_time] 2017-07-27T23:32:53.172+0000 d22010| 2017-07-27T23:32:53.169+0000 I NETWORK  [conn8] end connection 10.158.195.82:50080 (14 connections now open)', 
             gitRef: 'https://github.com/mongodb/mongo/blob/master/src/mongo/s/chunk.cpp#L39'},
            {line: '[js_test:after_cluster_time] 2017-07-27T23:32:53.172+0000 d22010| 2017-07-27T23:32:53.169+0000 I NETWORK  [conn8] end connection 10.158.195.82:50080 (14 connections now open)' 
             }
          ],
          */
          gitPage: "https://github.com/mongodb/mongo",
          isChanging: false
        };
        this.handleChangeUrl = this.handleChangeUrl.bind(this);
        this.handleChangeFilter = this.handleChangeFilter.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChangeUrl(event) {
        this.setState({isChanging: true});
        this.setState({url: event.target.value});
    }

    handleChangeFilter(event) {
        this.setState({isChanging: true});
        this.setState({filter: event.target.value});
    }

    shouldComponentUpdate(nextProps, nextState) {
        let shouldUpdate = !nextState.isChanging;
        return shouldUpdate;
    }

    processResponse(result, filter) {
        let processed = {}
        try {
            let gitVersionMaster = "master";
            let gitVersion = "master";
            let isGitVersionSet = false;
            const gitPrefix = "https://github.com/mongodb/mongo/blob/";
            const key = "data";
            const gitVersionStr = "git version: ";
            const prefix = "{githash:";
            const prefixLen = prefix.length + 2;
            processed[key] = [];
            
            let lines = result.split('\n');
            
            for (let i in lines) {
               let line = lines[i];
               if (!line.match(filter)) {
                   continue;
               }
               if (!isGitVersionSet) {
                   let gitVersionPos = line.indexOf(gitVersionStr);
                   if (gitVersionPos !== -1) {
                       gitVersion = line.substr(gitVersionPos + gitVersionStr.length);
                       isGitVersionSet = true;
                   }
               }
               const startIdx = line.indexOf(prefix);
               if (startIdx !== -1) {
                  const stopIdx = line.indexOf("}", startIdx);
                  if (stopIdx > startIdx + prefixLen) {
                      const fileLine = line.substr(startIdx+prefixLen, stopIdx-(startIdx+prefixLen)-1);
                      const textLine = line.substr(0, startIdx-1) + line.substr(stopIdx+1);
                      let foobar = line.split('}', 1);
                      processed[key].push({gitRef:gitPrefix + gitVersion + "/" + fileLine, line:textLine}); 
                  }
               }
               else {
                 processed[key].push({line:lines[i]}); 
               }
            }
            return Promise.resolve(processed);
        }
        catch (error) {
//           showError();
        }
    }

    handleSubmit(event) {
      let self = this;
      axios.post('http://localhost:9000/api/log', { url: this.state.url })
      .then(function (response) {
        console.log("got response");
        let processed = [];
        let gitVersionMaster = "master";
        let gitVersion = "master";
        let isGitVersionSet = false;
        const gitPrefix = "https://github.com/mongodb/mongo/blob/";
        const gitVersionStr = "git version: ";
        const prefix = "{githash:";
        const prefixLen = prefix.length + 2;
        
        let lines = response.data.split('\n');
        
        for (let i in lines) {
           let line = lines[i];
           if (!line.match(self.state.filter)) {
               continue;
           }
           if (!isGitVersionSet) {
               let gitVersionPos = line.indexOf(gitVersionStr);
               if (gitVersionPos !== -1) {
                   gitVersion = line.substr(gitVersionPos + gitVersionStr.length);
                   isGitVersionSet = true;
               }
           }
           const startIdx = line.indexOf(prefix);
           if (startIdx !== -1) {
              const stopIdx = line.indexOf("}", startIdx);
              if (stopIdx > startIdx + prefixLen) {
                  const fileLine = line.substr(startIdx+prefixLen, stopIdx-(startIdx+prefixLen)-1);
                  const textLine = line.substr(0, startIdx-1) + line.substr(stopIdx+1);
                  let foobar = line.split('}', 1);
                  processed.push({gitRef:gitPrefix + gitVersion + "/" + fileLine, line:textLine}); 
              }
           }
           else {
             processed.push({line:lines[i]}); 
           }
        }
        self.setState({isChanging: false});
        self.setState({data: processed});
      })
      .catch(function (error) {
        console.log(error);
      });
    }

  render() {
      //let url = 'https://logkeeper.mongodb.org/build/db6fa7c6a6d5fae2c959dd0996b71ead/test/59811f87c2ab68415701df6d?raw=1';
      //let filter = 'd21760';
      let url, filter;
      return (
   <div>
   <form onSubmit={this.handleSubmit}>
    <table>
    <tr><td><label> Log: </label></td><td><input type="text" size="100" value={url} onChange={this.handleChangeUrl} /></td></tr>
    <tr><td><label> Filter: </label></td><td><input type="text" size="100" value={filter} onChange={this.handleChangeFilter} /></td></tr>
    <tr><input type="submit" value="Get the log!" /></tr>
    </table>
  </form>

  <LogView data = {this.state.data} handleClick = {this.handleClick}/>
  </div>
  );
  }
}
export default Fetch;
