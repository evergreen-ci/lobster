// @flow

import React from 'react';
import type { Node as ReactNode } from 'react';
import * as actions from '../../actions';
import * as logviewerActions from '../../actions/logviewer';
import './style.css';
import LogView from '../LogView/index';
import { Bookmarks } from './Bookmarks';
import { connect } from 'react-redux';
import queryString from '../../thirdparty/query-string';
import Toolbar from './Toolbar';
import lines from '../../selectors/lines';
import type { Dispatch } from 'redux';
import type { Log, LogIdentity, Settings, Filter, Highlight, Bookmark, Line } from '../../models';
import type { ContextRouter } from 'react-router-dom';

type Props = {
  log: Log,
  match: {
    params: {
      build: string,
      test: string,
      [key: string]: ?string
    }
  },
  logIdentity: ?LogIdentity,
  loadLogByIdentity: (LogIdentity) => void,
  settings: Settings,
  loadInitialFilters: (Filter[]) => void,
  loadInitialHighlights: (Highlight[]) => void,
  filterList: Filter[],
  highlightList: Highlight[],
  bookmarks: Bookmark[],
  loadBookmarks: (Bookmark[]) => void,
  toggleBookmark: (number[]) => void,
  ensureBookmark: (number) => void,
  findIdx: number,
  changeFindIdx: (number) => void,
  searchRegex: string,
  changeSearch: (RegExp) => void,
  addFilter: (string) => void,
  addHighlight: (string) => void,
  findResults: LineData
} & ContextRouter

type State = {
  scrollLine: number,
  lines?: Line[],
}


export class Fetch extends React.Component<Props, State> {
  urlInput: ?HTMLInputElement;
  static defaultProps = {
    bookmarks: []
  }

  constructor(props: Props) {
    super(props);
    // this.componentWillReceiveProps = this.componentWillReceiveProps(this);
    const locationSearch = props.location.search;
    const parsed = queryString.parse(locationSearch === '' ? props.location.hash : locationSearch);
    const bookmarksList = parsed.bookmarks;
    let bookmarksArr = [];
    if (bookmarksList) {
      bookmarksArr = bookmarksList.split(',').map((n)=>({ lineNumber: parseInt(n, 10) }));
    }
    this.props.loadBookmarks(bookmarksArr);
    this.state = {
      scrollLine: parseInt(parsed.scroll, 10)
    };
    const initialFilters = ((typeof parsed.f === 'string' ? [parsed.f] : parsed.f) || []).map((f) => ({ text: f.substring(2), on: (f.charAt(0) === '1'), inverse: (f.charAt(1) === '1') }));
    this.props.loadInitialFilters(initialFilters);
    const initialHighlights = ((typeof parsed.h === 'string' ? [parsed.h] : parsed.h) || []).map((h) => ({ text: h.substring(2), on: (h.charAt(0) === '1'), line: (h.charAt(1) === '1') }));
    this.props.loadInitialHighlights(initialHighlights);
    if (locationSearch !== '') {
      this.updateURL(this.props.bookmarks, this.props.filterList, this.props.highlightList);
    }
    if (this.props.logIdentity) {
      this.props.loadLogByIdentity(this.props.logIdentity);
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.filterList !== prevProps.filterList) {
      this.updateURL(this.props.bookmarks, this.props.filterList, this.props.highlightList);
      // this.clearFind();
    }
    if (this.props.log.isDone && ((JSON.stringify(this.props.bookmarks) !== JSON.stringify(prevProps.bookmarks)) || this.props.log.lines !== prevProps.log.lines)) {
      this.updateURL(this.props.bookmarks, this.props.filterList, this.props.highlightList);
    }
    if (this.props.settings !== prevProps.settings) {
      this.find();
    }
  }

  static getDerivedStateFromProps(nextProps: Props, prevState: State) {
    if (nextProps.log.lines !== prevState.lines) {
      return { lines: nextProps.log.lines };
    }
    return null;
  }

  makeFilterURLString(filter: Filter): string {
    let res = '';
    res += (filter.on ? '1' : '0');
    res += (filter.inverse ? '1' : '0');
    res += filter.text;
    return res;
  }

  makeHighlightURLString(highlight: Highlight): string {
    let res = '';
    res += (highlight.on ? '1' : '0');
    res += (highlight.line ? '1' : '0');
    res += highlight.text;
    return res;
  }

  updateURL(bookmarks: Bookmark[], filters: Filter[], highlights: Highlight[]) {
    const parsed = {};
    for (let i = 0; i < filters.length; i++) {
      parsed.f = this.makeFilterURLString(filters[i]);
    }
    for (let i = 0; i < highlights.length; i++) {
      parsed.h = this.makeHighlightURLString(highlights[i]);
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
    if (this.state.url) {
      parsed.url = this.state.url;
    }
    window.history.replaceState({}, '', this.props.location.pathname + '#' + queryString.stringify(parsed));
  }

  handleSubmit = (event: KeyboardEvent) => {
    console.log('handleSubmit');
    event.preventDefault();
    // prepare do to the change
    if (this.urlInput && this.urlInput.value && !this.state.server) {
      console.log('must set a server parameter for a custom log URL');
      return;
    }

    this.updateURL(this.props.bookmarks, this.props.filterList, this.props.highlightList);
    let value = null;
    if (this.urlInput) {
      value = this.urlInput.value;
    } else {
      return;
    }
    if (value !== this.state.url) {
      this.props.changeFindIdx(-1);
      this.setState({ url: value, findResults: [] });
      this.props.loadBookmarks([]);
      this.props.loadLogByIdentity({
        type: 'lobster',
        server: this.state.server ? this.state.server : '',
        file: this.state.url ? this.state.url : ''
      });
    }
  }

  setScroll = (lineNum: number) => {
    this.setState({ scrollLine: lineNum });
  }

  findBookmark(bookmarkList: Bookmark[], lineNum: number): number {
    return bookmarkList.findIndex(function(bookmark) {
      return bookmark.lineNumber === lineNum;
    });
  }

  showLines(): ?ReactNode {
    if (!this.props.log.lines) {
      return <div />;
    }
    const findLine = this.props.findResults.findResults[this.props.findIdx];
    return (
      <LogView
        scrollLine={this.state.scrollLine}
        findBookmark={this.findBookmark}
        toggleBookmark={this.props.toggleBookmark}
        bookmarks={this.props.bookmarks}
        findLine={findLine ? findLine.lineNumber : -1}
        lines={this.props.findResults}
      />);
  }

  render() {
    return (
      <div>
        <Bookmarks bookmarks={this.props.bookmarks} setScroll={this.setScroll} />
        <div className="main">
          <Toolbar
            findResults={this.props.findResults}
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
  return {
    ...state,
    ...ownProps,
    settings: state.logviewer.settings,
    findIdx: state.logviewer.find.findIdx,
    searchRegex: state.logviewer.find.searchRegex,
    filterList: state.logviewer.filters,
    highlightList: state.logviewer.highlights,
    bookmarks: state.logviewer.bookmarks,
    findResults: lines(state)
  };
}

function mapDispatchToProps(dispatch: Dispatch<*>, ownProps) {
  return {
    loadInitialFilters: (initialFilters) => dispatch(logviewerActions.loadInitialFilters(initialFilters)),
    loadInitialHighlights: (initialHighlights) => dispatch(logviewerActions.loadInitialHighlights(initialHighlights)),
    addFilter: (text) => dispatch(logviewerActions.addFilter(text)),
    addHighlight: (text) => dispatch(logviewerActions.addHighlight(text)),
    changeFindIdx: (index) => dispatch(logviewerActions.changeFindIdx(index)),
    loadBookmarks: (bookmarksArr) => dispatch(logviewerActions.loadBookmarks(bookmarksArr)),
    toggleBookmark: (lineNumArray) => dispatch(logviewerActions.toggleBookmark(lineNumArray)),
    ensureBookmark: (lineNum) => dispatch(logviewerActions.ensureBookmark(lineNum)),
    changeSearch: (text) => dispatch(logviewerActions.changeSearch(text)),
    loadLogByIdentity: (identity) => dispatch(actions.loadLog(identity)),
    ...ownProps
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Fetch);
