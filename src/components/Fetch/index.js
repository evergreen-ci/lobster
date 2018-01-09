
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
            scrollLine: parseInt(searchParams.get('scroll')),
            server: searchParams.get('server'),
            url : searchParams.get('url'),
            wrap: false,
            caseSensitive: false,
            detailsOpen: true,
            filterList: searchParams.getAll('f').map((f) => ({text: f.substring(2), on: (f.charAt(0) === '1'), inverse: (f.charAt(1) === '1')})),
            find: "",
            findIdx: -1,
            findResults: [],
            bookmarks: bookmarksArr,
        };

        if(this.state.url) {
            Actions.loadDataUrl(this.state.url, this.state.server);
        }
        else if (this.state.build) { // this is direct route to a file
            Actions.loadData(this.state.build, this.state.test, this.state.server);
        }
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
        return {build: this.state.build, test: this.state.test};
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
            if(this.state.scrollLine !== parseInt(searchParams.get('scroll'))){
                console.log("set scroll to: " + searchParams.get('scroll'));
                this.setState({scrollLine: parseInt(searchParams.get('scroll'))});
            }
        }
        // reload and rerender
        else {
            console.log("set state to server: " + searchParams.get('server'));
            this.setState({build: params.build,
                       test: params.test,
                       filter: searchParams.get('filter'),
                       scrollLine: parseInt(searchParams.get('scroll')),
                       server: searchParams.get('server')});
            let url = "";
            if (this.urlInput) {
                url = this.urlInput.value.trim();
            }

            if (url) {
                this.setState({url : url});
            }
        }
        if(this.props.lines.length != nextProps.lines.length && nextProps.lines.length >0) {
            let newBookmarks = this.ensureBookmark(0, this.state.bookmarks);
            newBookmarks = this.ensureBookmark(nextProps.lines[nextProps.lines.length-1].lineNumber, newBookmarks);
            if(newBookmarks.length != this.state.bookmarks.length) {
                this.updateURL(newBookmarks, this.state.filterList);
                this.setState({bookmarks: newBookmarks});
            }
        }
    }

    makeFilterURLString(filter) {
        let res = "";
        res += (filter.on ? '1' : '0');
        res += (filter.inverse ? '1' : '0');
        res += filter.text;
        return res;
    }

    updateURL(bookmarks, filters) {
        let parsedParams = this.getUrlParams();
        var searchParams = new URLSearchParams();
        
        // make url match this state
        let nextUrl = "";
        if (!this.urlInput || !this.urlInput.value) {
            nextUrl = "/lobster/build/" + parsedParams.build + "/test/" + parsedParams.test;
        } else {
            searchParams.append("url", this.urlInput.value);
        }
        for(let i = 0; i < filters.length; i++) {
            searchParams.append("f", this.makeFilterURLString(filters[i]));
        }
        if(parsedParams.scrollLine) {
            searchParams.append("scroll", parsedParams.scrollLine);
        }
        if(bookmarks.length > 0) {
            let bookmarkStr = '';
            for(let i = 0; i < bookmarks.length; i++) {
                bookmarkStr += bookmarks[i].lineNumber;
                if (i != bookmarks.length-1) {
                    bookmarkStr += ',';
                }
            }
            searchParams.append('bookmarks', bookmarkStr);
        }
        if (this.state.server) {
            searchParams.append('server', this.state.server);
        }
        this.props.history.push({
            pathname: nextUrl,
            search: searchParams.toString(),
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

        this.updateURL(this.state.bookmarks, this.state.filterList);

        if (this.urlInput.value != this.state.url)
        {
          this.setState({url : this.urlInput.value, bookmarks: [], findResults: [], findIdx: -1});
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
     this.updateURL(newBookmarks, this.state.filterList);
    }

    ensureBookmark(lineNum, bookmarks) {
     let newBookmarks = bookmarks.slice();
     var i = this.findBookmark(newBookmarks, lineNum);
     if (i === -1) {
        newBookmarks.push({lineNumber: lineNum});
        newBookmarks.sort(this.bookmarkSort);
     } 
     return newBookmarks;
    }

    showBookmarks() {
        let self = this;
        return (
              <div>{self.state.bookmarks.map(function(bookmark){
                return <div onClick={self.setScroll.bind(self, bookmark.lineNumber)}>{bookmark.lineNumber}</div>;
              })}</div>
          );
    }
    
    nextFind() {
        let nextIdx = this.state.findIdx+1;
        if (nextIdx==this.state.findResults.length) {
            nextIdx = 0;
        }
        this.setState({findIdx: nextIdx})
        this.setScroll(this.state.findResults[nextIdx]);
    }

    prevFind() {
        let nextIdx = this.state.findIdx-1;
        if (nextIdx==-1) {
            nextIdx = this.state.findResults.length-1;
        }
        this.setState({findIdx: nextIdx})
        this.setScroll(this.state.findResults[nextIdx]);
    }

    find(caseSensitive, event) {
        if(event) {
            event.preventDefault();
        }
        // Trim |'s so highlighter doesn't hang.
        this.findInput.value=this.findInput.value.replace(/(^\|)|(\|$)/g, "");
        let findRegexp = this.findInput.value;

        if(findRegexp == "") {
            this.clearFind();
            return;
        }

        if(findRegexp == this.state.find && caseSensitive == this.state.caseSensitive) {
            if(this.state.findResults.length > 0) {
                return this.nextFind();
            }
            return;
        }

        let findResults = [];
        let filter = this.mergeOnFilters(this.state.filterList, caseSensitive);
        let inverseFilter = this.mergeOnInverseFilters(this.state.filterList, caseSensitive);
        let findRegexpFull = this.makeRegexp(findRegexp, caseSensitive);

        for(let i=0; i< this.props.lines.length; i++) {
            let line = this.props.lines[i];
            if(line.text.match(findRegexpFull) && this.shouldPrintLine(this.state.bookmarks, line, filter, inverseFilter)) {
                findResults.push(line.lineNumber);
            }
        }
        if(findResults.length > 0) {
            this.setState({find: findRegexp, findIdx: 0, findResults: findResults})
            this.setScroll(findResults[0]);
        } else {
            this.setState({find: findRegexp, findIdx: -1, findResults: findResults})
        }
    }

    clearFind() {
        this.setState({find: "", findIdx: -1, findResults: []});
    }

    shouldPrintLine(bookmarks, line, filter, inverseFilter) {
        if(this.findBookmark(bookmarks, line.lineNumber) !== -1) {
            return true;
        }
        if(!filter && !inverseFilter) {
            return true;
        } else if(!filter) {
            if(line.text.match(inverseFilter)) {
                return false;
            } 
            return true;
        } else if(!inverseFilter) {
            if(line.text.match(filter)) {
                return true;
            }
            return false;
        } else {
            // If there are both types of filters, it has to match the filter and not match
            // the inverseFilter.
            if(line.text.match(filter) && !line.text.match(inverseFilter)) {
                return true;
            }
            return false;
        }
        throw 'Unreachable';
    }

    addFilter() {
        if(this.findInput.value == "" || this.state.filterList.find((elem) => elem.text == this.findInput.value)) {
            return;
        }
        let newFilters = this.state.filterList.slice();
        newFilters.push({text: this.findInput.value, on: true, inverse: false});
        this.setState({filterList: newFilters});
        this.updateURL(this.state.bookmarks, newFilters);
        this.clearFind();
    }

    toggleFilter(text) {
        let newFilters = this.state.filterList.slice();
        let filterIdx = newFilters.findIndex((elem) => text == elem.text);
        newFilters[filterIdx].on = !newFilters[filterIdx].on;

        this.setState({filterList: newFilters});
        this.updateURL(this.state.bookmarks, newFilters);
        this.clearFind();
    }

    toggleFilterInverse(text) {
        let newFilters = this.state.filterList.slice();
        let filterIdx = newFilters.findIndex((elem) => text == elem.text);
        newFilters[filterIdx].inverse = !newFilters[filterIdx].inverse;

        this.setState({filterList: newFilters});
        this.updateURL(this.state.bookmarks, newFilters);
        this.clearFind();
    }

    removeFilter(text) {
        let newFilters = this.state.filterList.slice();
        let filterIdx = newFilters.findIndex((elem) => text == elem.text);
        newFilters.splice(filterIdx, 1);

        this.setState({filterList: newFilters});
        this.updateURL(this.state.bookmarks, newFilters);
        this.clearFind();
    }
    showFilters() {
        let self = this;
        return (
              <div className="filter-box">{self.state.filterList.map(function(filter){
                return <div className='filter'>
                        <Button className='filter-button' onClick={self.removeFilter.bind(self, filter.text)} bsStyle="danger" bsSize="xsmall">{"\u2715"}</Button>
                        <Button className='filter-button' onClick={self.toggleFilter.bind(self, filter.text)} bsStyle="warning" bsSize="xsmall">{filter.on ? "||" : "\u25B6"}</Button>
                        <Button className='filter-button-big' onClick={self.toggleFilterInverse.bind(self, filter.text)} bsStyle="success" bsSize="xsmall">{filter.inverse ? "out" : "in"}</Button>
                        <span className='filter-text'>{filter.text}</span>
                    </div>;
              })}</div>
          );
    }

    makeRegexp(regexp, caseSensitive) {
        if(!regexp) {
            return '';
        }

        if (!caseSensitive) {
            return new RegExp(regexp, "i");
        }
        return new RegExp(regexp);
    }

    mergeOnFilters(filterList, caseSensitive) {
        let fullFilter = filterList.filter((elem) => elem.on && !elem.inverse).map((elem) => elem.text).join('|');
        return this.makeRegexp(fullFilter, caseSensitive);
    }

    mergeOnInverseFilters(filterList, caseSensitive) {
        let fullInverseFilter = filterList.filter((elem) => elem.on && elem.inverse).map((elem) => elem.text).join('|'); 
        return this.makeRegexp(fullInverseFilter, caseSensitive);
    }

    showLines() {
     let filter = this.mergeOnFilters(this.state.filterList, this.state.caseSensitive);
     let inverseFilter = this.mergeOnInverseFilters(this.state.filterList, this.state.caseSensitive);
     if (!this.props.lines) {
       return <div/>
     } else {
       return <LogView lines={this.props.lines}
       colorMap={this.props.colorMap}
       filter={filter}
       inverseFilter={inverseFilter}
       scrollLine={this.state.scrollLine}
       wrap={this.state.wrap}
       caseSensitive={this.state.caseSensitive}
       findBookmark={this.findBookmark}
       toggleBookmark={this.toggleBookmark.bind(this)}
       bookmarks={this.state.bookmarks}
       find={this.state.find}
       findLine={this.state.findIdx == -1 ? -1 : this.state.findResults[this.state.findIdx]}
       shouldPrintLine={this.shouldPrintLine.bind(this)}
       />
     }
   }

    showFind() {
        if(this.state.find != "" ){
            if(this.state.findResults.length > 0) {
                return <span><Col lg={1} componentClass={ControlLabel} >{this.state.findIdx+1}/{this.state.findResults.length}</Col>
                <Button lg={1} onClick={this.nextFind.bind(this)}>Next</Button>
                <Button lg={1} onClick={this.prevFind.bind(this)}>Prev</Button></span>
            } else {
                return <Col lg={1} componentClass={ControlLabel} className="not-found" >Not Found</Col>;
            }
        }
    }

    showJIRA() {
        if(this.state.bookmarks.length == 0 || this.props.lines.length == 0) {
            return '';
        }

        let text = "{noformat}\n"
        for(let i = 0; i< this.state.bookmarks.length; i++) {
            let curr = this.state.bookmarks[i].lineNumber;
            if(curr >= this.props.lines.length) {
                text += '{noformat}';
                return text;
            }

            text += this.props.lines[curr].text + '\n'
            if((i != (this.state.bookmarks.length-1)) && (this.state.bookmarks[i+1].lineNumber != (curr+1))) {
                text += '...\n';
            }
        }
        text += '{noformat}';
        return text;
    }

    showLogBox() {
        if(this.state.server) {
            return (<FormGroup controlId="urlInput">
                <Col componentClass={ControlLabel} lg={1}>Log</Col>
                <Col lg={6}><FormControl type="text" defaultValue={this.state.url}
                    placeholder="optional. custom file location iff used with local server" inputRef={ref => { this.urlInput = ref; }}  /></Col>
                <Col lg={1}> <Button type="submit"> Apply </Button> </Col>
            </FormGroup>);
        }
    }
    
    showJobLogs() {
        if(!this.state.server) {
            return (<Col lg={1}><Button href={"/build/" + this.state.build}>Job Logs</Button></Col>);
        }
    }

    toggleCaseSensitive(value) {
        this.setState({caseSensitive: !value});
        this.find(!value);
    }

    componentDidMount() {
          document.addEventListener("keydown", this.handleKeyDown.bind(this));
    }
    componentWillUnmount() {
          document.removeEventListener("keydown", this.handleKeyDown.bind(this));
    }

    handleKeyDown(event) {
        switch( event.keyCode ) {
            case 114: // F3
                this.focusOnFind(event);
                break;
            case 70: // F
                if(event.ctrlKey) {
                    this.focusOnFind(event);
                }
                break;
            default:
                break;
       }
    }

    focusOnFind(event) {
        this.findInput.focus();
        event.preventDefault();
    }

    render() {
        return (
            <div>
            <div className="bookmarks-bar monospace">
            {this.showBookmarks()}
            </div>
            <div className="main">
            <Col lg={11} lgOffset={1}>
            <div className="find-box">
                <Form horizontal >
                    <FormGroup controlId="findInput" className='filter-header'>
                        <Col lg={6} ><FormControl type="text"
                            placeholder="optional. regexp to search for"
                            inputRef={ref => { this.findInput = ref; }}/></Col>
                        <Button type="submit" lg={1} onClick={this.find.bind(this, this.state.caseSensitive)}>Find</Button>
                        {this.showFind()}
                        <Button lg={1} onClick={this.addFilter.bind(this)}>Add Filter</Button>
                        <Button lg={1} onClick={() => this.setState({ detailsOpen: !this.state.detailsOpen })}>{this.state.detailsOpen ? "Hide Details" : "Show Details"}</Button>
                    </FormGroup>
                <Collapse className='collapse-menu' in={this.state.detailsOpen}>
                    <div>
                        <Form horizontal onSubmit={this.handleSubmit}>
                                {this.showLogBox()}
                                <FormGroup controlId="wrap">
                                    <Col componentClass={ControlLabel} lg={1}>Wrap</Col>
                                    <Col lg={1}><ToggleButton value={this.state.wrap || false} onToggle={(value) => {this.setState({wrap: !value})}} /></Col>
                                    <Col componentClass={ControlLabel} lg={2}>Case Sensitive</Col>
                                    <Col lg={1}><ToggleButton value={this.state.caseSensitive || false} onToggle={this.toggleCaseSensitive.bind(this)} /></Col>
                                    <Col componentClass={ControlLabel} lg={1}>JIRA</Col>
                                    <Col lg={2}><textarea readOnly className='unmoving' value={this.showJIRA()}></textarea></Col>
                                    {this.showJobLogs()}
                                </FormGroup>
                        </Form>
                    <div className="filterBox">
                        {this.showFilters()}
                    </div>
                    </div>
                </Collapse>
                </Form>
            </div>
            </Col>
            <div className="log-list">
             {this.showLines()}
            </div>
            </div>
             </div>
        );
    }
}
export default Fetch;
