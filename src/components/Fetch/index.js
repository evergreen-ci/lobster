
import React, {Component} from 'react';
import Reflux from 'reflux';
import axios from 'axios';
import Actions from '../../actions';
import './style.css';
import withRouter from "react-router-dom/es/withRouter";
import ToggleButton from 'react-toggle-button';
import Button from 'react-bootstrap/lib/Button';
import Form from 'react-bootstrap/lib/Form';
import FormControl from 'react-bootstrap/lib/FormControl';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import Col from 'react-bootstrap/lib/Col';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import Collapse from 'react-bootstrap/lib/Collapse';
import LogView from "../LogView/index";
import PropTypes from 'prop-types';
import LobsterStore from '../../stores';

class Fetch extends Component {
  static propTypes = {
      lines: PropTypes.array,
    };

    constructor(props) {
        super(props);
        this.logkeeperBaseUrl = 'https://logkeeper.mongodb.org';
        this.handleSubmit = this.handleSubmit.bind(this);
        //this.componentWillReceiveProps = this.componentWillReceiveProps(this);
        let searchParams = new URLSearchParams(props.location.search);
        let params = this.props.match.params;
        let bookmarksList = searchParams.get('bookmarks');
        let bookmarksArr = [];
        if (bookmarksList) {
            bookmarksArr = bookmarksList.split(',').map((n)=>({lineNumber: parseInt(n)}));
        }
        this.state = {
            build: params.build,
            test: params.test,
            filter: searchParams.get('filter'),
            scrollLine: searchParams.get('scroll'),
            server: searchParams.get('server'),
            url : "",
            wrap: false,
            detailsOpen: false,
            filterList: {},
            bookmarks: bookmarksArr,
        };
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
                this.setState({url : url});
            }
        }
        if(nextProps.lines.length >0) {
            this.ensureBookmark(0);
            this.ensureBookmark(nextProps.lines[nextProps.lines.length-1].lineNumber);
        }
    }

    updateURL(bookmarks) {
        let parsedParams = this.getUrlParams();
        // make url match this state
        let nextUrl = "";
        if (!this.urlInput || !this.urlInput.value) {
            nextUrl = "/lobster/build/" + parsedParams.build + "/test/" + parsedParams.test;
        } else {
              this.setState({url : this.urlInput.value});
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
            if (bookmarks.length > 0 || this.state.server){
                searchString += "&";
            }
        }
        if(bookmarks.length > 0) {
            searchString +="bookmarks=";
            for(let i = 0; i < bookmarks.length; i++) {
                searchString += bookmarks[i].lineNumber;
                if (i != bookmarks.length-1) {
                    searchString += ',';
                }
            }
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

    handleSubmit(event) {
        console.log("handleSubmit");
        event.preventDefault();
        // prepare do to the change
        if (this.urlInput && this.urlInput.value && !this.state.server) {
            console.log("must set a server parameter for a custom log URL");
            return;
        }

        this.updateURL(this.state.bookmarks);

        if (this.urlInput.value != this.state.url)
        {
          Actions.loadDataUrl(this.urlInput.value, this.state.server);
        }
    }

    setScroll(lineNum) {
        this.setState({scrollLine: lineNum});
    }
    
    findBookmark(bookmarkList, lineNum) {
         return bookmarkList.findIndex(function(bookmark) {
            return bookmark.lineNumber === lineNum;
        });
    }
    
    bookmarkSort(b1, b2) {
        return b1.lineNumber - b2.lineNumber;
    }

    toggleBookmark(lineNum) {
     let newBookmarks = this.state.bookmarks.slice();
     var i = this.findBookmark(newBookmarks, lineNum);
     if (i === -1) {
        newBookmarks.push({lineNumber: lineNum});
     } else {
        newBookmarks.splice(i, 1);
     }
     newBookmarks.sort(this.bookmarkSort);
     this.setState({bookmarks: newBookmarks});
     this.updateURL(newBookmarks);
    }

    ensureBookmark(lineNum) {
     let newBookmarks = this.state.bookmarks.slice();
     var i = this.findBookmark(newBookmarks, lineNum);
     if (i === -1) {
        newBookmarks.push({lineNumber: lineNum});
        newBookmarks.sort(this.bookmarkSort);
        this.setState({bookmarks: newBookmarks});
        this.updateURL(newBookmarks);
     } 
    }

    showBookmarks() {
        let self = this;
        return (
              <div>{self.state.bookmarks.map(function(bookmark){
                return <div onClick={self.setScroll.bind(self, bookmark.lineNumber)}>{bookmark.lineNumber}</div>;
              })}</div>
          );
    }

    showLines() {
     if (!this.props.lines) {
       return <div/>
     } else {
       return <LogView lines={this.props.lines}
       colorMap={this.props.colorMap}
       filter={this.state.filter}
       scrollLine={this.state.scrollLine}
       wrap={this.state.wrap}
       findBookmark={this.findBookmark}
       toggleBookmark={this.toggleBookmark.bind(this)}
       bookmarks={this.state.bookmarks}
       />
     }
   }
    render() {
        debugger;
        return (
            <div>
            <div className="bookmarks-bar monospace">
            {this.showBookmarks()}
            </div>
            <div className="main">
            <div>
            <Form horizontal onSubmit={this.handleSubmit}>
                <FormGroup controlId="filterInput">
                    <Col componentClass={ControlLabel} lg={2}>Filter</Col>
                    <Col lg={7}><FormControl type="text"
                        placeholder="optional. regexp to match each line"
                        defaultValue={this.state.filter} inputRef={ref => { this.filterInput = ref; }}/></Col>
                </FormGroup>
                <Collapse in={this.state.detailsOpen}>
                <div>
                    <FormGroup controlId="urlInput">
                        <Col componentClass={ControlLabel} lg={2}>Log</Col>
                        <Col lg={7}><FormControl type="text"
                            placeholder="optional. custom file location iff used with local server" inputRef={ref => { this.urlInput = ref; }}  /></Col>
                    </FormGroup>
                    <FormGroup controlId="wrap">
                        <Col componentClass={ControlLabel} lg={2}>Wrap</Col>
                        <Col lg={7}><ToggleButton value={this.state.wrap || false} onToggle={(value) => {this.setState({wrap: !value})}} /></Col>
                    </FormGroup>
                    <FormGroup controlId="scrollInput">
                        <Col componentClass={ControlLabel} lg={2}>Scroll to Line</Col>
                        <Col lg={7}><FormControl type="text"
                            placeholder="optional"
                            defaultValue={this.state.scrollLine} inputRef={ref => { this.scrollInput = ref; }}/></Col>
                    </FormGroup>
                </div>
                </Collapse>
                <FormGroup>
                    <Col componentClass={ControlLabel} lg={2} onClick={() => this.setState({ detailsOpen: !this.state.detailsOpen })}>Details</Col>
                    <Col lg={7}> <Button type="submit"> Apply </Button> </Col>
                </FormGroup>
            </Form>
            </div>
            <div className="log-list">
             {this.showLines()}
            </div>
            </div>
             </div>
        );
    }
}
export default Fetch;
