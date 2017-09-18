import React from 'react';
import axios from 'axios';

import './style.css';
import withRouter from "react-router-dom/es/withRouter";
import LogView from "../LogView/index";

class Fetch extends React.Component {

    constructor(props) {
        super(props);
        this.logkeeperBaseUrl = 'https://logkeeper.mongodb.org';
        this.handleSubmit = this.handleSubmit.bind(this);
        let searchParams = new URLSearchParams(props.location.search);
        let params = this.props.match.params;
        this.state = {
            build: params.build,
            test: params.test,
            filter: searchParams.get('filter'),
            scrollLine: searchParams.get('scroll'),
            server: searchParams.get('server'),
            lines: []
        };
        this.loadData(this.state.build, this.state.test, this.state.server);
    }

    getUrlParams() {
      // parse
    /*
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
      test = test && test[1] ? test[1] : "";
      return {build: build, test: test, filter: this.filterInput.value.trim(), scrollLine: this.scrollInput.value.trim()}
    */
        return {build: this.state.build, test: this.state.test, filter: this.filterInput.value.trim(), scrollLine: this.scrollInput.value.trim()}
    }

    componentWillReceiveProps(nextProps){
        console.log("componentWillReceiveProps");
        let params = nextProps.match.params;
        let searchParams = new URLSearchParams(nextProps.location.search);
        // don't reload, just update state
        if(params.build === this.state.build && params.test === this.state.test && !searchParams.get('server')){
            // update the filter in the child component and return
            if(this.state.filter !== searchParams.get('filter')){
                console.log("set filter to " + searchParams.get('filter'))
                this.setState({filter: searchParams.get('filter')});
            }
            if(this.state.scrollLine !== searchParams.get('scroll')){
                console.log("set scroll to: " + searchParams.get('scroll'));
                this.setState({scrollLine: searchParams.get('scroll')});
            }
        }
        // reload and rerender
        else {
            console.log("set state to server: " + searchParams.get('server'));
            this.setState({build: params.build, 
                       test: params.test, 
                       filter: searchParams.get('filter'), 
                       scrollLine: searchParams.get('scroll'),
                       server: searchParams.get('server')});
            let url = "";
            if (this.urlInput) {
                url = this.urlInput.value.trim();
            }

            if (url) {
                this.loadDataUrl(url, this.state.server);
            }
            else {
              this.loadData(this.state.build, this.state.test, this.state.server);
            }
        }
    }

    handleSubmit(event) {
        console.log("handleSubmit");
        event.preventDefault();
        // prepare do to the change
        if (this.urlInput && this.urlInput.value && !this.state.server) {
            console.log("must set a server parameter for a custom log URL"); 
            return;
        }

        let parsedParams = this.getUrlParams();
        // make url match this state
        let nextUrl = "";
        if (!this.urlInput || !this.urlInput.value) {
            nextUrl = "/lobster/build/" + parsedParams.build + "/test/" + parsedParams.test;
        }
        // make url match next state
        let searchString = "?";
        if(parsedParams.filter){
            searchString += "filter=" + parsedParams.filter;
            if(parsedParams.scrollLine || this.state.server){
                searchString += "&";
            }
        }
        if(parsedParams.scrollLine) {
            searchString += "scroll=" + parsedParams.scrollLine;
            if (this.state.server){
                searchString += "&";
            }
        }
        if (this.state.server) {
            searchString += "server=" + this.state.server;
        }
        this.props.history.push({
            pathname: nextUrl,
            search: searchString,
        });
    }

    // Loads content from server
    loadDataUrl(url, server){
        if(server){
            console.log("server: " + server );
            console.log("url: " + url );
            axios.post("http://" + server, {url: url })
              .then((response) => this.processServerResponse(response))
              .catch((error) => console.log(error));
        }
    }

    loadData(build, test, server){
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
    }

    generateLogkeeperUrl(buildParam, testParam){
        if(!buildParam){
            return "";
        }
        if(!testParam){
            return this.logkeeperBaseUrl + "/build/" + buildParam + "/all?raw=1";
        }
        return this.logkeeperBaseUrl + "/build/" + buildParam + "/test/" + testParam + "?raw=1";
    }

    processServerResponse(response){
        // set the url to the url we requested
        let lines = response.data.split('\n');
        this.setState({lines: lines});
    }

    render() {
        return (
            <div>
            <form onSubmit={this.handleSubmit}>
            <table className="header-table">
            <tbody>
            <tr><td><label> Filter: </label></td><td><input type="text" size="70" placeholder="optional. regexp to match each line" defaultValue={this.state.filter} ref={(input) => { this.filterInput = input; }}/></td>
            <td><label> Scroll to Line: </label></td><td><input type="text" size="5" placeholder="optional" faultValue={this.state.scrollLine} ref={(input) => { this.scrollInput = input; }} /></td>
            <td><input className="header-button" type="submit" value="Apply"/></td></tr>
            {/* commented out to exclude from logkeeper for now
             <tr><td><label> Log: </label></td><td><input type="text" size="100" placeholder="optional. custom file location iff used with local server" ref={(input) => { this.urlInput = input; }} /></td></tr>
            */}
            </tbody>
            </table>
            </form>
             {this.state.lines.length > 0 && <LogView lines={this.state.lines}
                                           filter={this.state.filter}
                                           scrollLine={this.state.scrollLine}/>
             }
            </div>

        );
    }
}
export default withRouter(Fetch);
