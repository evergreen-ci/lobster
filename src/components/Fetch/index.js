import React from 'react';
import * as actions from '../../actions';
import './style.css';
import Button from 'react-bootstrap/lib/Button';
import Col from 'react-bootstrap/lib/Col';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import LogView from '../LogView/index';
import PropTypes from 'prop-types';
import { Bookmarks } from './Bookmarks';
import { connect } from 'react-redux';
import queryString from '../../thirdparty/query-string';
import { Toolbar } from './Toolbar';

// eslint-disable-next-line react/no-deprecated
export class Fetch extends React.Component {
  static propTypes = {
    log: PropTypes.shape({
      lines: PropTypes.array,
      colorMap: PropTypes.object
    }),
    location: PropTypes.shape({
      search: PropTypes.string,
      hash: PropTypes.string
    }),
    match: PropTypes.shape({
      params: PropTypes.shape({
        build: PropTypes.string,
        test: PropTypes.string
      })
    }),
    history: PropTypes.object,
    lobsterLoadData: PropTypes.func.isRequired,
    loadData: PropTypes.func.isRequired,
    settings: PropTypes.shape({
      wrap: PropTypes.bool.isRequired,
      caseSensitive: PropTypes.bool.isRequired,
      filterIntersection: PropTypes.bool.isRequired
    }),
    loadInitialFilters: PropTypes.func,
    loadInitialHighlights: PropTypes.func,
    filterList: PropTypes.array,
    addFilter: PropTypes.func,
    addHighlight: PropTypes.func,
    highlightList: PropTypes.array,
    bookmarks: PropTypes.array,
    loadBookmarks: PropTypes.func,
    toggleBookmark: PropTypes.func
  };

  static defaultProps = {
    lines: [],
    bookmarks: []
  }

  constructor(props) {
    super(props);
    // this.componentWillReceiveProps = this.componentWillReceiveProps(this);
    const locationSearch = props.location.search;
    const parsed = queryString.parse(locationSearch === '' ? props.location.hash : locationSearch);
    const params = this.props.match.params;
    const bookmarksList = parsed.bookmarks;
    let bookmarksArr = [];
    if (bookmarksList) {
      bookmarksArr = bookmarksList.split(',').map((n)=>({lineNumber: parseInt(n, 10)}));
    }
    this.props.loadBookmarks(bookmarksArr);
    this.state = {
      build: params.build,
      test: params.test,
      scrollLine: parseInt(parsed.scroll, 10),
      server: parsed.server || null,
      url: parsed.url || null,
      detailsOpen: false,
      find: '',
      findIdx: -1,
      findResults: []
    };
    const initialFilters = ((typeof parsed.f === 'string' ? [parsed.f] : parsed.f) || []).map((f) => ({text: f.substring(2), on: (f.charAt(0) === '1'), inverse: (f.charAt(1) === '1')}));
    this.props.loadInitialFilters(initialFilters);
    const initialHighlights = ((typeof parsed.h === 'string' ? [parsed.h] : parsed.h) || []).map((h) => ({text: h.substring(2), on: (h.charAt(0) === '1'), line: (h.charAt(1) === '1')}));
    this.props.loadInitialHighlights(initialHighlights);
    if (locationSearch !== '') {
      this.updateURL(this.props.bookmarks, this.props.filterList, this.props.highlightList);
    }
    if (this.state.url) {
      this.props.lobsterLoadData(this.state.server, this.state.url);
    } else if (this.state.build) {
      this.props.loadData(this.state.build, this.state.test);
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

  componentDidUpdate(prevProps) {
    if (this.props.filterList !== prevProps.filterList) {
      this.updateURL(this.props.bookmarks, this.props.filterList, this.props.highlightList);
      this.clearFind();
    }
    if (this.props.bookmarks !== prevProps.bookmarks) {
      this.updateURL(this.props.bookmarks, this.props.filterList, this.props.highlightList);
    }
  }

  componentWillReceiveProps(nextProps) {
    console.log('componentWillReceiveProps');
    const params = nextProps.match.params;
    const nextLocationSearch = nextProps.location.search;
    const parsed = new URLSearchParams(nextLocationSearch === '' ? nextProps.location.hash : nextLocationSearch);
    // don't reload, just update state
    if (params.build === this.state.build && params.test === this.state.test && !parsed.sever) {
    // update the filter in the child component and return
      if (this.state.filter !== parsed.filter) {
        console.log('set filter to ' + parsed.filter);
        this.setState({filter: parsed.filter});
      }
      if (this.state.scrollLine !== parseInt(parsed.scroll, 10)) {
        console.log('set scroll to: ' + parsed.scroll);
        this.setState({scrollLine: parseInt(parsed.scroll, 10)});
      }
    // reload and rerender
    } else {
      console.log('set state to server: ' + parsed.server);
      this.setState({build: params.build,
        test: params.test,
        filter: parsed.filter,
        scrollLine: parseInt(parsed.scroll, 10),
        server: parsed.server});
      let url = '';
      if (this.urlInput) {
        url = this.urlInput.value.trim();
      }

      if (url) {
        this.setState({url: url});
      }
    }
    if (this.props.log.lines.length !== nextProps.log.lines.length && nextProps.log.lines.length > 0) {
      let newBookmarks = this.ensureBookmark(0, this.props.bookmarks);
      newBookmarks = this.ensureBookmark(nextProps.log.lines[nextProps.log.lines.length - 1].lineNumber, newBookmarks);
      if (newBookmarks.length !== this.props.bookmarks.length) {
        this.props.loadBookmarks(newBookmarks);
        this.updateURL(newBookmarks, this.props.filterList, this.props.highlightList);
      }
    }
  }

  makeFilterURLString(filter) {
    let res = '';
    res += (filter.on ? '1' : '0');
    res += (filter.inverse ? '1' : '0');
    res += filter.text;
    return res;
  }

  makeHighlightURLString(highlight) {
    let res = '';
    res += (highlight.on ? '1' : '0');
    res += (highlight.line ? '1' : '0');
    res += highlight.text;
    return res;
  }

  updateURL(bookmarks, filters, highlights) {
    const parsedParams = this.getUrlParams();
    // const locationSearch = this.props.location.search;
    const parsed = [];

    for (let i = 0; i < filters.length; i++) {
      parsed.f = this.makeFilterURLString(filters[i]);
    }
    for (let i = 0; i < highlights.length; i++) {
      parsed.h = this.makeHighlightURLString(highlights[i]);
    }
    if (parsedParams.scrollLine) {
      parsed.scroll = parsedParams.scrollLine;
    }
    if (bookmarks.length > 0) {
      let bookmarkStr = '';
      for (let i = 0; i < bookmarks.length; i++) {
        bookmarkStr += bookmarks[i].lineNumber;
        if (i !== bookmarks.length - 1) {
          bookmarkStr += ',';
        }
      }
      parsed.bookmarks = bookmarkStr;
    }
    if (this.state.server) {
      parsed.server = this.state.server;
    }
    window.history.replaceState({}, '', window.location.pathname + '#' + queryString.stringify(parsed));
  }

  handleSubmit = (event) => {
    console.log('handleSubmit');
    event.preventDefault();
    // prepare do to the change
    if (this.urlInput && this.urlInput.value && !this.state.server) {
      console.log('must set a server parameter for a custom log URL');
      return;
    }

    this.updateURL(this.props.bookmarks, this.props.filterList, this.props.highlightList);

    if (this.urlInput.value !== this.state.url) {
      this.setState({url: this.urlInput.value, bookmarks: [], findResults: [], findIdx: -1});
      this.props.lobsterLoadData(this.state.server, this.state.url);
    }
  }

  setScroll = (lineNum) => {
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

  ensureBookmark(lineNum, bookmarks) {
    const newBookmarks = bookmarks.slice();
    const i = this.findBookmark(newBookmarks, lineNum);
    if (i === -1) {
      newBookmarks.push({lineNumber: lineNum});
      newBookmarks.sort(this.bookmarkSort);
    }
    return newBookmarks;
  }

  nextFind = () => {
    let nextIdx = this.state.findIdx + 1;
    if (nextIdx === this.state.findResults.length) {
      nextIdx = 0;
    }
    this.setState({findIdx: nextIdx});
    this.setScroll(this.state.findResults[nextIdx]);
  }

  prevFind = () => {
    let nextIdx = this.state.findIdx - 1;
    if (nextIdx === -1) {
      nextIdx = this.state.findResults.length - 1;
    }
    this.setState({findIdx: nextIdx});
    this.setScroll(this.state.findResults[nextIdx]);
  }

  find = (event) => {
    if (event) {
      event.preventDefault();
      if (event.keyCode === 13 && event.shiftKey) {
        return;
      }
    }
    const findRegexp = this.findInput.value;

    if (findRegexp === '') {
      this.clearFind();
      return;
    }

    if (findRegexp === this.state.find) {
      if (this.state.findResults.length > 0) {
        return this.nextFind();
      }
      return;
    }

    const findResults = [];
    const filter = this.mergeActiveFilters(this.props.filterList, this.props.settings.caseSensitive);
    const inverseFilter = this.mergeActiveInverseFilters(this.props.filterList, this.props.settings.caseSensitive);
    const findRegexpFull = this.makeRegexp(findRegexp, this.props.settings.caseSensitive);

    for (let i = 0; i < this.props.log.lines.length; i++) {
      const line = this.props.log.lines[i];
      if (line.text.match(findRegexpFull) && this.shouldPrintLine(this.props.bookmarks, line, filter, inverseFilter)) {
        findResults.push(line.lineNumber);
      }
    }

    if (findResults.length > 0) {
      this.setState({find: findRegexp, findIdx: 0, findResults: findResults});
      this.setScroll(findResults[0]);
    } else {
      this.setState({find: findRegexp, findIdx: -1, findResults: findResults});
    }
  }

  clearFind() {
    this.setState({find: '', findIdx: -1, findResults: []});
  }

  shouldPrintLine = (bookmarks, line, filter, inverseFilter) => {
    if (this.findBookmark(bookmarks, line.lineNumber) !== -1) {
      return true;
    }

    if ((!filter && !inverseFilter) || (filter.length === 0 && inverseFilter.length === 0)) {
      return true;
    } else if (!filter || filter.length === 0) {
      if (this.matchFilters(inverseFilter, line.text)) {
        return false;
      }
      return true;
    } else if (!inverseFilter || inverseFilter.length === 0) {
      if (this.matchFilters(filter, line.text, this.props.settings.filterIntersection)) {
        return true;
      }
      return false;
    }
    // If there are both types of filters, it has to match the filter and not match
    // the inverseFilter.
    if (this.props.settings.filterIntersection) {
      if (this.matchFilters(filter, line.text, this.props.settings.filterIntersection) &&
            !this.matchFilters(inverseFilter, line.text)) {
        return true;
      }
    } else if (this.matchFilters(filter, line.text, this.props.settings.filterIntersection) ||
          !this.matchFilters(inverseFilter, line.text)) {
      return true;
    }
    return false;
  }

  shouldHighlightLine = (line, highlight, highlightLine) => {
    if (!highlight || highlight.length === 0) {
      return false;
    }
    if (this.matchFilters(highlight, line.text, this.props.settings.filterIntersection) && this.matchFilters(highlightLine, line.text)) {
      return true;
    }
    return false;
  }

  addFilter = () => {
    if (this.findInput.value === '' || this.props.filterList.find((elem) => elem.text === this.findInput.value)) {
      return;
    }
    this.props.addFilter(this.findInput.value);
    this.updateURL(this.props.bookmarks, this.props.filterList, this.props.highlightList);
    this.clearFind();
  }

  addHighlight = () => {
    if (this.findInput.value === '' || this.props.highlightList.find((elem) => elem.text === this.findInput.value)) {
      return;
    }
    this.props.addHighlight(this.findInput.value);
    this.updateURL(this.props.bookmarks, this.props.filterList, this.props.highlightList);
    this.clearFind();
  }

  makeRegexp(regexp, caseSensitive) {
    if (!regexp) {
      return '';
    }

    if (!caseSensitive) {
      return new RegExp(regexp, 'i');
    }
    return new RegExp(regexp);
  }

  mergeActiveFilters(filterList, caseSensitive) {
    return filterList
      .filter((elem) => elem.on && !elem.inverse)
      .map((elem) => caseSensitive ? new RegExp(elem.text) : new RegExp(elem.text, 'i'));
  }

  mergeActiveInverseFilters(filterList, caseSensitive) {
    return filterList
      .filter((elem) => elem.on && elem.inverse)
      .map((elem) => caseSensitive ? new RegExp(elem.text) : new RegExp(elem.text, 'i'));
  }

  mergeActiveHighlights(highlightList, caseSensitive) {
    return highlightList
      .filter((elem) => elem.on)
      .map((elem) => caseSensitive ? new RegExp(elem.text) : new RegExp(elem.text, 'i'));
  }

  mergeActiveHighlightLines(highlightList, caseSensitive) {
    return highlightList
      .filter((elem) => elem.on && elem.line)
      .map((elem) => caseSensitive ? new RegExp(elem.text) : new RegExp(elem.text, 'i'));
  }

  getHighlightText(highlightList) {
    const highlight = [];
    highlightList.forEach((element) => {
      if (element.on && !element.line) {
        highlight.push(element.text);
      }
    });
    return highlight;
  }

  // Checks a given string against a list of regular expression filters
  // If isIntersection === false, will return true if the string matches at least one regex
  // Otherwise, will return true if the string matches all regexes
  matchFilters(filter, string, isIntersection) {
    if (isIntersection) {
      return filter.every(regex => string.match(regex));
    }
    return filter.some(regex => string.match(regex));
  }

  showLines() {
    const filter = this.mergeActiveFilters(this.props.filterList, this.props.settings.caseSensitive);
    const inverseFilter = this.mergeActiveInverseFilters(this.props.filterList, this.props.settings.caseSensitive);
    const highlight = this.mergeActiveHighlights(this.props.highlightList, this.props.settings.caseSensitive);
    const highlightText = this.getHighlightText(this.props.highlightList);
    const highlightLine = this.mergeActiveHighlightLines(this.props.highlightList, this.props.settings.caseSensitive);
    if (!this.props.log.lines) {
      return <div />;
    }
    return (
      <LogView
        filter={filter}
        inverseFilter={inverseFilter}
        highlight={highlight}
        highlightLine={highlightLine}
        scrollLine={this.state.scrollLine}
        findBookmark={this.findBookmark}
        toggleBookmark={this.props.toggleBookmark}
        bookmarks={this.props.bookmarks}
        find={this.state.find}
        highlightText={highlightText}
        findLine={this.state.findIdx === -1 ? -1 : this.state.findResults[this.state.findIdx]}
        shouldPrintLine={this.shouldPrintLine}
        shouldHighlightLine={this.shouldHighlightLine}
      />);
  }

  showFind = () => {
    if (this.state.find !== '') {
      if (this.state.findResults.length > 0) {
        return (
          <span><Col lg={1} componentClass={ControlLabel} >{this.state.findIdx + 1}/{this.state.findResults.length}</Col>
            <Button onClick={this.nextFind}>Next</Button>
            <Button onClick={this.prevFind}>Prev</Button>
          </span>);
      }
      return <Col lg={1} componentClass={ControlLabel} className="not-found" >Not Found</Col>;
    }
  }

  showJIRA() {
    if (this.props.bookmarks.length === 0 || this.props.log.lines.length === 0) {
      return '';
    }

    let text = '{noformat}\n';
    for (let i = 0; i < this.props.bookmarks.length; i++) {
      const curr = this.props.bookmarks[i].lineNumber;
      if (curr >= this.props.log.lines.length) {
        text += '{noformat}';
        return text;
      }

      text += this.props.log.lines[curr].text + '\n';
      if ((i !== (this.props.bookmarks.length - 1)) && (this.props.bookmarks[i + 1].lineNumber !== (curr + 1))) {
        text += '...\n';
      }
    }
    text += '{noformat}';
    return text;
  }

  setURLRef = (ref) => {this.urlInput = ref;}

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown);
    if (this.findInput) {
      this.findInput.addEventListener('keydown', this.handleShiftEnter);
    }
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown);
    if (this.findInput) {
      this.findInput.removeEventListener('keydown', this.handleShiftEnter);
    }
  }

  handleKeyDown = (event) => {
    switch (event.keyCode) {
      case 114: // F3
        this.focusOnFind(event);
        break;
      case 70: // F
        if (event.ctrlKey || event.metaKey) {
          this.focusOnFind(event);
        }
        break;
      default:
        break;
    }
  }

  focusOnFind(event) {
    this.findInput.focus();
    this.findInput.select();
    event.preventDefault();
  }

  handleChangeFindEvent = () => {
    this.find(this.props.settings.caseSensitive);
  }

  handleShiftEnter = (event) => {
    if (this.state.findResults.length !== 0) {
      if (event.keyCode === 13 && event.shiftKey) {
        event.preventDefault();
        this.prevFind();
      }
    }
  }

  togglePanel = () => this.setState((state) => ({detailsOpen: !state.detailsOpen}));
  setFormRef = (ref) => {this.findInput = ref;}

  render() {
    return (
      <div>
        <Bookmarks bookmarks={this.props.bookmarks} setScroll={this.setScroll} />
        <div className="main">
          <Toolbar
            setFormRef={this.setFormRef}
            handleChangeFindEvent={this.handleChangeFindEvent}
            find={this.find}
            showFind={this.showFind}
            addFilter={this.addFilter}
            addHighlight={this.addHighlight}
            togglePanel={this.togglePanel}
            detailsOpen={this.state.detailsOpen}
            handleSubmit={this.handleSubmit}
            server={this.state.server}
            build={this.state.build}
            url={this.state.url}
            setURLRef={this.setURLRef}
            valueJIRA={this.showJIRA()}
            highlightList={this.state.highlightList}
            removeHighlight={this.removeHighlight}
            toggleHighlight={this.toggleHighlight}
            toggleHighlightLine={this.toggleHighlightLine}
            findResults={this.state.findResults}
            findIdx={this.state.findIdx}
          />
          <div className="log-list">
            {this.showLines()}
          </div>
        </div>
      </div>
    );
  }
}

// This is not the ideal way to do this, but it allows for better compatibility
// as we migrate towards the react-redux model
function mapStateToProps(state, ownProps) {
  return {...state, ...ownProps, lines: state.log.lines, colorMap: state.log.colorMap,
    filterList: state.filters, settings: state.settings, highlightList: state.highlights, bookmarks: state.bookmarks};
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    lobsterLoadData: (server, url) => dispatch(actions.lobsterLoadData(server, url)),
    loadData: (build, test) => dispatch(actions.loadData(build, test)),
    loadInitialFilters: (initialFilters) => dispatch(actions.loadInitialFilters(initialFilters)),
    loadInitialHighlights: (initialHighlights) => dispatch(actions.loadInitialHighlights(initialHighlights)),
    addFilter: (text) => dispatch(actions.addFilter(text)),
    addHighlight: (text) => dispatch(actions.addHighlight(text)),
    loadBookmarks: (bookmarksArr) => dispatch(actions.loadBookmarks(bookmarksArr)),
    toggleBookmark: (lineNumArray) => dispatch(actions.toggleBookmark(lineNumArray)),
    ...ownProps
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Fetch);
