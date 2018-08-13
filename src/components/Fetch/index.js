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
import type { LineData, Log, LogIdentity, Settings, Filter, Highlight, Bookmark, Line } from '../../models';
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
  lineData: LineData
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
    const locationSearch = props.location.search;
    const parsed = queryString.parse(locationSearch === '' ? props.location.hash : locationSearch);
    this.state = {
      scrollLine: parseInt(parsed.scroll, 10)
    };
    if (this.props.logIdentity) {
      this.props.loadLogByIdentity(this.props.logIdentity);
    }
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
      this.setState({ url: value });
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

  showLines(): ?ReactNode {
    if (!this.props.log.lines) {
      return <div />;
    }
    const findLine = this.props.lineData.findResults[this.props.findIdx];
    return (
      <LogView
        scrollLine={this.state.scrollLine}
        toggleBookmark={this.props.toggleBookmark}
        bookmarks={this.props.bookmarks}
        findLine={findLine ? findLine : -1}
        lineData={this.props.lineData}
      />);
  }

  render() {
    return (
      <div>
        <Bookmarks bookmarks={this.props.bookmarks} setScroll={this.setScroll} />
        <div className="main">
          <Toolbar
            lineData={this.props.lineData}
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
    ...ownProps,
    ...state,
    settings: state.logviewer.settings,
    findIdx: state.logviewer.find.findIdx,
    searchRegex: state.logviewer.find.searchRegex,
    filterList: state.logviewer.filters,
    highlightList: state.logviewer.highlights,
    bookmarks: state.logviewer.bookmarks,
    lineData: lines(state)
  };
}

function mapDispatchToProps(dispatch: Dispatch<*>, ownProps) {
  return {
    ...ownProps,
    loadInitialFilters: (initialFilters) => dispatch(logviewerActions.loadInitialFilters(initialFilters)),
    loadInitialHighlights: (initialHighlights) => dispatch(logviewerActions.loadInitialHighlights(initialHighlights)),
    changeFindIdx: (index) => dispatch(logviewerActions.changeFindIdx(index)),
    loadBookmarks: (bookmarksArr) => dispatch(logviewerActions.loadBookmarks(bookmarksArr)),
    toggleBookmark: (lineNumArray) => dispatch(logviewerActions.toggleBookmark(lineNumArray)),
    ensureBookmark: (lineNum) => dispatch(logviewerActions.ensureBookmark(lineNum)),
    changeSearch: (text) => dispatch(logviewerActions.changeSearch(text)),
    loadLogByIdentity: (identity) => dispatch(actions.loadLog(identity))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Fetch);
