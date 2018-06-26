import React from 'react';
import { loadData, lobsterLoadData } from '../../actions';
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
    lines: PropTypes.array,
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

    colorMap: PropTypes.object,
    lobsterLoadData: PropTypes.func.isRequired,
    loadData: PropTypes.func.isRequired
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
    this.state = {
      build: params.build,
      test: params.test,
      scrollLine: parseInt(parsed.scroll, 10),
      server: parsed.server || null,
      url: parsed.url || null,
      wrap: false,
      caseSensitive: false,
      filterIntersection: false,
      detailsOpen: false,
      filterList: ((typeof parsed.f === 'string' ? [parsed.f] : parsed.f) || []).map((f) => ({text: f.substring(2), on: (f.charAt(0) === '1'), inverse: (f.charAt(1) === '1')})),
      highlightList: ((typeof parsed.h === 'string' ? [parsed.h] : parsed.h) || []).map((h) => ({text: h.substring(2), on: (h.charAt(0) === '1'), line: (h.charAt(1) === '1')})),
      find: '',
      findIdx: -1,
      findResults: [],
      bookmarks: bookmarksArr
    };
    if (locationSearch !== '') {
      this.updateURL(this.state.bookmarks, this.state.filterList, this.state.highlightList);
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

  componentWillReceiveProps(nextProps) {
    console.log('componentWillReceiveProps');
    const params = nextProps.match.params;
    const searchParams = new URLSearchParams(nextProps.location.search);
    // don't reload, just update state
    if (params.build === this.state.build && params.test === this.state.test && !searchParams.get('server')) {
    // update the filter in the child component and return
      if (this.state.filter !== searchParams.get('filter')) {
        console.log('set filter to ' + searchParams.get('filter'));
        this.setState({filter: searchParams.get('filter')});
      }
      if (this.state.scrollLine !== parseInt(searchParams.get('scroll'), 10)) {
        console.log('set scroll to: ' + searchParams.get('scroll'));
        this.setState({scrollLine: parseInt(searchParams.get('scroll'), 10)});
      }
    // reload and rerender
    } else {
      console.log('set state to server: ' + searchParams.get('server'));
      this.setState({build: params.build,
        test: params.test,
        filter: searchParams.get('filter'),
        scrollLine: parseInt(searchParams.get('scroll'), 10),
        server: searchParams.get('server')});
      let url = '';
      if (this.urlInput) {
        url = this.urlInput.value.trim();
      }

      if (url) {
        this.setState({url: url});
      }
    }
    if (this.props.lines.length !== nextProps.lines.length && nextProps.lines.length > 0) {
      let newBookmarks = this.ensureBookmark(0, this.state.bookmarks);
      newBookmarks = this.ensureBookmark(nextProps.lines[nextProps.lines.length - 1].lineNumber, newBookmarks);
      if (newBookmarks.length !== this.state.bookmarks.length) {
        this.updateURL(newBookmarks, this.state.filterList, this.state.highlightList);
        this.setState({bookmarks: newBookmarks});
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
    const locationSearch = this.props.location.search;
    const parsed = queryString.parse(locationSearch === '' ? this.props.location.hash : locationSearch);

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

    this.updateURL(this.state.bookmarks, this.state.filterList, this.state.highlightList);

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

  toggleBookmark = (lineNumArray) => {
    let remove = true;
    const newBookmarks = this.state.bookmarks.slice();
    lineNumArray.forEach((element) => {
      const index = this.findBookmark(newBookmarks, element);
      if (index === -1) {
        newBookmarks.push({lineNumber: element});
        remove = false;
      }
    });
    if (remove) {
      lineNumArray.forEach((element) => {
        const removeIndex = this.findBookmark(newBookmarks, element);
        newBookmarks.splice(removeIndex, 1);
      });
    }
    newBookmarks.sort(this.bookmarkSort);
    this.setState({bookmarks: newBookmarks});
    this.updateURL(newBookmarks, this.state.filterList, this.state.highlightList);
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
    const filter = this.mergeActiveFilters(this.state.filterList, this.state.caseSensitive);
    const inverseFilter = this.mergeActiveInverseFilters(this.state.filterList, this.state.caseSensitive);
    const findRegexpFull = this.makeRegexp(findRegexp, this.state.caseSensitive);

    for (let i = 0; i < this.props.lines.length; i++) {
      const line = this.props.lines[i];
      if (line.text.match(findRegexpFull) && this.shouldPrintLine(this.state.bookmarks, line, filter, inverseFilter)) {
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
      if (this.matchFilters(filter, line.text, this.state.filterIntersection)) {
        return true;
      }
      return false;
    }
    // If there are both types of filters, it has to match the filter and not match
    // the inverseFilter.
    if (this.state.filterIntersection) {
      if (this.matchFilters(filter, line.text, this.state.filterIntersection) &&
            !this.matchFilters(inverseFilter, line.text)) {
        return true;
      }
    } else if (this.matchFilters(filter, line.text, this.state.filterIntersection) ||
          !this.matchFilters(inverseFilter, line.text)) {
      return true;
    }
    return false;
  }

  shouldHighlightLine = (line, highlight, highlightLine) => {
    if (!highlight || highlight.length === 0) {
      return false;
    }
    if (this.matchFilters(highlight, line.text, this.state.filterIntersection) && this.matchFilters(highlightLine, line.text)) {
      return true;
    }
    return false;
  }

  addFilter = () => {
    if (this.findInput.value === '' || this.state.filterList.find((elem) => elem.text === this.findInput.value)) {
      return;
    }
    const newFilters = this.state.filterList.slice();
    newFilters.push({text: this.findInput.value, on: true, inverse: false});
    this.setState({filterList: newFilters});
    this.updateURL(this.state.bookmarks, newFilters, this.state.highlightList);
    this.clearFind();
  }

  addHighlight = () => {
    if (this.findInput.value === '' || this.state.highlightList.find((elem) => elem.text === this.findInput.value)) {
      return;
    }
    const newHighlights = this.state.highlightList.slice();
    newHighlights.push({text: this.findInput.value, on: true, line: true});
    this.setState({highlightList: newHighlights});
    this.updateURL(this.state.bookmarks, this.state.filterList, newHighlights);
    this.clearFind();
  }

  toggleFilter = (text) => {
    const newFilters = this.state.filterList.slice();
    const filterIdx = newFilters.findIndex((elem) => text === elem.text);
    newFilters[filterIdx].on = !newFilters[filterIdx].on;

    this.setState({filterList: newFilters});
    this.updateURL(this.state.bookmarks, newFilters, this.state.highlightList);
    this.clearFind();
  }

  toggleFilterInverse = (text) => {
    const newFilters = this.state.filterList.slice();
    const filterIdx = newFilters.findIndex((elem) => text === elem.text);
    newFilters[filterIdx].inverse = !newFilters[filterIdx].inverse;

    this.setState({filterList: newFilters});
    this.updateURL(this.state.bookmarks, newFilters, this.state.highlightList);
    this.clearFind();
  }

  toggleHighlight = (text) => {
    const newHighlights = this.state.highlightList.slice();
    const highlightIdx = newHighlights.findIndex((elem) => text === elem.text);
    newHighlights[highlightIdx].on = !newHighlights[highlightIdx].on;

    this.setState({highlightList: newHighlights});
    this.updateURL(this.state.bookmarks, this.state.filterList, newHighlights);
    this.clearFind();
  }

  toggleHighlightLine = (text) => {
    const newHighlights = this.state.highlightList.slice();
    const highlightIdx = newHighlights.findIndex((elem) => text === elem.text);
    newHighlights[highlightIdx].line = !newHighlights[highlightIdx].line;

    this.setState({highlightList: newHighlights});
    this.updateURL(this.state.bookmarks, this.state.filterList, newHighlights);
    this.clearFind();
  }

  removeFilter = (text) => {
    const newFilters = this.state.filterList.slice();
    const filterIdx = newFilters.findIndex((elem) => text === elem.text);
    newFilters.splice(filterIdx, 1);

    this.setState({filterList: newFilters});
    this.updateURL(this.state.bookmarks, newFilters, this.state.highlightList);
    this.clearFind();
  }

  removeHighlight = (text) => {
    const newHighlights = this.state.highlightList.slice();
    const highlightIdx = newHighlights.findIndex((elem) => text === elem.text);
    newHighlights.splice(highlightIdx, 1);

    this.setState({highlightList: newHighlights});
    this.updateURL(this.state.bookmarks, this.state.filterList, newHighlights);
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
    const filter = this.mergeActiveFilters(this.state.filterList, this.state.caseSensitive);
    const inverseFilter = this.mergeActiveInverseFilters(this.state.filterList, this.state.caseSensitive);
    const highlight = this.mergeActiveHighlights(this.state.highlightList, this.state.caseSensitive);
    const highlightText = this.getHighlightText(this.state.highlightList);
    const highlightLine = this.mergeActiveHighlightLines(this.state.highlightList, this.state.caseSensitive);
    if (!this.props.lines) {
      return <div />;
    }
    return (
      <LogView
        lines={this.props.lines}
        colorMap={this.props.colorMap}
        filter={filter}
        inverseFilter={inverseFilter}
        highlight={highlight}
        highlightLine={highlightLine}
        scrollLine={this.state.scrollLine}
        wrap={this.state.wrap}
        caseSensitive={this.state.caseSensitive}
        findBookmark={this.findBookmark}
        toggleBookmark={this.toggleBookmark}
        bookmarks={this.state.bookmarks}
        find={this.state.find}
        highlightText={highlightText}
        findLine={this.state.findIdx === -1 ? -1 : this.state.findResults[this.state.findIdx]}
        shouldPrintLine={this.shouldPrintLine}
        shouldHighlightLine={this.shouldHighlightLine}
      />);
  }

  showFind() {
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
    if (this.state.bookmarks.length === 0 || this.props.lines.length === 0) {
      return '';
    }

    let text = '{noformat}\n';
    for (let i = 0; i < this.state.bookmarks.length; i++) {
      const curr = this.state.bookmarks[i].lineNumber;
      if (curr >= this.props.lines.length) {
        text += '{noformat}';
        return text;
      }

      text += this.props.lines[curr].text + '\n';
      if ((i !== (this.state.bookmarks.length - 1)) && (this.state.bookmarks[i + 1].lineNumber !== (curr + 1))) {
        text += '...\n';
      }
    }
    text += '{noformat}';
    return text;
  }

  setURLRef = (ref) => {this.urlInput = ref;}

  toggleCaseSensitive = (value) => {
    this.setState({caseSensitive: !value});
    this.find();
  }

  toggleFilterIntersection = (value) => {
    this.setState({filterIntersection: !value});
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown);
    this.findInput.addEventListener('keydown', this.handleShiftEnter);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown);
    this.findInput.removeEventListener('keydown', this.handleShiftEnter);
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
    this.find(this.state.caseSensitive);
  }

  handleShiftEnter = (event) => {
    if (this.state.findResults.length !== 0) {
      if (event.keyCode === 13 && event.shiftKey) {
        event.preventDefault();
        this.prevFind();
      }
    }
  }

  toggleWrap = (value) => this.setState({wrap: !value});
  togglePanel = () => this.setState((state) => ({detailsOpen: !state.detailsOpen}));
  setFormRef = (ref) => {this.findInput = ref;}

  render() {
    return (
      <div>
        <Bookmarks bookmarks={this.state.bookmarks} setScroll={this.setScroll} />
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
            wrap={this.state.wrap}
            toggleWrap={this.toggleWrap}
            caseSensitive={this.state.caseSensitive}
            toggleCaseSensitive={this.toggleCaseSensitive}
            filterIntersection={this.state.filterIntersection}
            toggleFilterIntersection={this.toggleFilterIntersection}
            server={this.state.server}
            build={this.state.build}
            url={this.state.url}
            setURLRef={this.setURLRef}
            valueJIRA={this.showJIRA()}
            filterList={this.state.filterList}
            removeFilter={this.removeFilter}
            toggleFilter={this.toggleFilter}
            toggleFilterInverse={this.toggleFilterInverse}
            highlightList={this.state.highlightList}
            removeHighlight={this.removeHighlight}
            toggleHighlight={this.toggleHighlight}
            toggleHighlightLine={this.toggleHighlightLine}
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
  return {...state, ...ownProps, lines: state.log.lines, colorMap: state.log.colorMap};
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    lobsterLoadData: (server, url) => dispatch(lobsterLoadData(server, url)),
    loadData: (build, test) => dispatch(loadData(build, test)),
    ...ownProps
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Fetch);
