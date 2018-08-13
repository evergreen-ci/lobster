// @flow

import React from 'react';
import type { Node as ReactNode } from 'react';
import * as actions from '../../actions';
import './style.css';
import LogView from '../LogView/index';
import { Bookmarks } from './Bookmarks';
import { connect } from 'react-redux';
import queryString from '../../thirdparty/query-string';
import Toolbar from './Toolbar';
import * as selectors from '../../selectors';
import type { Dispatch } from 'redux';
import type { ReduxState, LineData, LogIdentity, Settings, Filter, Highlight, Bookmark, Line } from '../../models';
import type { ContextRouter } from 'react-router-dom';

type Props = {
  lines: Line[],
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
  toggleBookmark: (number[]) => void,
  ensureBookmark: (number) => void,
  findIdx: number,
  changeFindIdx: (number) => void,
  changeSearch: (RegExp) => void,
  lineData: LineData
} & ContextRouter

type State = {
  scrollLine: number
}

export class Fetch extends React.PureComponent<Props, State> {
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


  setScroll = (lineNum: number) => {
    this.setState({ scrollLine: lineNum });
  }

  showLines(): ?ReactNode {
    if (!this.props.lines) {
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
function mapStateToProps(state: ReduxState, ownProps) {
  return {
    ...ownProps,
    lines: selectors.getLogLines(state),
    settings: selectors.getSettings(state),
    findIdx: selectors.getFind(state).findIdx,
    filterList: selectors.getFilters(state),
    highlightList: selectors.getHighlights(state),
    bookmarks: selectors.getBookmarks(state),
    lineData: selectors.getLines(state)
  };
}

function mapDispatchToProps(dispatch: Dispatch<*>, ownProps) {
  return {
    ...ownProps,
    loadInitialFilters: (initialFilters) => dispatch(actions.loadInitialFilters(initialFilters)),
    loadInitialHighlights: (initialHighlights) => dispatch(actions.loadInitialHighlights(initialHighlights)),
    changeFindIdx: (index) => dispatch(actions.changeFindIdx(index)),
    toggleBookmark: (lineNumArray) => dispatch(actions.toggleBookmark(lineNumArray)),
    ensureBookmark: (lineNum) => dispatch(actions.ensureBookmark(lineNum)),
    changeSearch: (text) => dispatch(actions.changeSearch(text)),
    loadLogByIdentity: (identity) => dispatch(actions.loadLog(identity))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Fetch);
