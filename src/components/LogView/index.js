import React from 'react';


import './style.css';
import {Element, scroller} from "react-scroll";


class LogView extends React.Component {


  handleClick(gitRef) {
     window.open(gitRef);
  }
  constructor(props){
    super(props);
    this.handleScrollSubmit = this.handleScrollSubmit.bind(this);
    this.state = {
      /**
       *  Backend dummy server that returns the logs by fetching from the provided url.
       */
      processed: '',
      scrollLine: 0,
      isChanging: true,
      /* sample to debug
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
    };
  }

  genHtml(jsonInput) {
     const objects = [];
     for ( let i in jsonInput)   {
         if (jsonInput[i].gitRef) {
             objects.push(
                <Element name={i}> <div className="gitref-link" key={i} onClick={this.handleClick.bind(this, jsonInput[i].gitRef)}>{jsonInput[i].line}</div> </Element>
             );
         }
         else {
             objects.push(
               <Element name={i}><div className="nogitref-link" key={i}>{jsonInput[i].line}</div></Element>
             );
         }
     }
     return (
        <div>{objects}</div>
     );
  }

  handleScrollSubmit(event){
    event.preventDefault();
    scroller.scrollTo(this.scrollInput.value, {});
  }

  render() {
    let self = this;
    let processed = [];
    let gitVersion = "master";
    let isGitVersionSet = false;
    const gitPrefix = "https://github.com/mongodb/mongo/blob/";
    const gitVersionStr = "git version: ";
    const prefix = "{githash:";
    const prefixLen = prefix.length + 2;
    let lines = self.props.lines;
    console.log(self.props);
    for (let i in lines) {
      let line = lines[i];
      if (self.props.filter && !line.match(self.props.filter)) {
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
        console.log(line);
        const stopIdx = line.indexOf("}", startIdx);
        if (stopIdx > startIdx + prefixLen) {
          const fileLine = line.substr(startIdx+prefixLen, stopIdx-(startIdx+prefixLen)-1);
          const textLine = line.substr(0, startIdx-1) + line.substr(stopIdx+1);
          processed.push({gitRef:gitPrefix + gitVersion + "/" + fileLine, line:textLine});
        }
      }
      else {
        processed.push({line:lines[i]});
      }
    }
    let output = self.genHtml(processed);
    if(output.length !== 0){
      return (<div><form onSubmit={this.handleScrollSubmit}>
        <table>
          <tbody>
          <tr><td><label> Scroll to Line: </label></td><td><input type="text" size="100" ref={(input) => { this.scrollInput = input; }} /></td></tr>
          <tr><td><input type="submit" value="Scroll" /></td></tr>
          </tbody>
        </table>
      </form>
      {output}
      </div>
      )
    }
    return (<div>Failed!</div>);
  }
}
export default LogView;
