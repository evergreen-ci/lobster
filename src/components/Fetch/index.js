import React from 'react';
import axios from 'axios';

import './style.css';
import withRouter from "react-router-dom/es/withRouter";
import LogView from "../LogView/index";

class Fetch extends React.Component {

    constructor(props) {
      super(props);
      this.handleSubmit = this.handleSubmit.bind(this);
      let searchParams = new URLSearchParams(props.location.search);
      let params = this.props.match.params;
      // default test param to be "all"
      let test = "all";
      if(params.test){
        test = params.test;
      }
        this.state = {
          serverUrl: 'https://logkeeper.mongodb.org',
          build: params.build,
          test: test,
          filter: searchParams.get('filter'),
          lines: []
        };
      this.loadData(this.state.build, this.state.test);
  }

    getUrlParams() {
      // parse
      let input = this.urlInput.value.trim();
      let buildRegex = /(?:build\/)([^/]+)/g;
      let testRegex = /(?:test\/)([^?|$]+)/g;
      let build = buildRegex.exec(input);
      let test = testRegex.exec(input);
      if(!build || !build[1]){
        console.log("Couldn't parse build version");
        return;
      }
      build = build[1];
      test = test && test[1] ? test[1] : "all";
      return {build: build, test: test, filter: this.filterInput.value.trim()}
    }

    componentWillReceiveProps(nextProps){
      let params = nextProps.match.params;
      let searchParams = new URLSearchParams(nextProps.location.search);
      if(params.build === this.state.build && params.test === this.state.test){
        // update the filter in the child component and return
        if(this.state.filter !== searchParams.get('filter')){
          console.log("set filter to " + searchParams.get('filter'))
          this.setState({filter: searchParams.get('filter')});
        }
      }
      else if(params.build !== this.state.build || params.test !== this.state.test){
        this.loadData(params.build, params.test);
        this.setState({build: params.build, test: params.test, filter: searchParams.get('filter')});
      }
    }

    handleSubmit(event) {
      event.preventDefault();
      // prepare do to the change
      let parsedParams = this.getUrlParams(this.urlInput, this.filterInput);
        // make url match this state
        let nextUrl = "/build/" + parsedParams.build + "/test/" + parsedParams.test;
        // make url match next state
        if(parsedParams.filter){
          this.props.history.push({
            pathname: nextUrl,
            search: "?filter=" + parsedParams.filter,
          });
        }
        else {
          this.props.history.push({
            pathname: nextUrl,
            search: ''
          });
        }
    }

    // Loads content from server
    loadData(build, test){
      let searchParams = new URLSearchParams(this.props.location.search);
      if(!build){
        return;
      }
      let serverParam = searchParams.get('server');
      if(serverParam){
        axios.post("http://" + serverParam + '/api/log', {buildId: build, testId: test })
          .then((response) => this.processServerResponse(response))
          .catch((error) => console.log(error));
      }
      else{
        axios.post(this.state.serverUrl + "/build/" + build + "/test/" + test + "?raw=1")
          .then((response) => this.processServerResponse(response))
          .catch((error) => console.log(error));
      }
    }

    processServerResponse(response){
      console.log("got response");
      let lines = response.data.split('\n');
      this.setState({lines: lines});
      console.log("set state");
    }

  render() {
      return (
   <div>
   <form onSubmit={this.handleSubmit}>
    <table>
    <tbody>
    <tr><td><label> Log: </label></td><td><input type="text" size="100" ref={(input) => { this.urlInput = input; }} /></td></tr>
    <tr><td><label> Filter: </label></td><td><input type="text" size="100" ref={(input) => { this.filterInput = input; }}/></td></tr>
    <tr><td><input type="submit" value="Get the log!" /></td></tr>
    </tbody>
    </table>
  </form>
     {this.state.lines.length > 0 && <LogView lines={this.state.lines}
                                   filter={this.state.filter}
                                   scrollLine={this.state.scrollLine}/>
     }
     {this.state.lines.length === 0 && this.state.url && <div>Loading!</div>}
  </div>

  );
  }
}
export default withRouter(Fetch);
