// @flow strict

import React from 'react';
import type { Node as ReactNode } from 'react';
import * as actions from '../../actions';
import './style.css';
import LogView from '../LogView/index';
import { Bookmarks } from './Bookmarks';
import { connect } from 'react-redux';
import Toolbar from './Toolbar';
import * as selectors from '../../selectors';
import type { Dispatch } from 'redux';
import type { ReduxState, LineData, LogIdentity, Bookmark, Line } from '../../models';
import type { ContextRouter } from 'react-router-dom';

type Props = {
  lines: Line[],
  bookmarks: Bookmark[],
  findIdx: number,
  lineData: LineData,
  logIdentity: ?LogIdentity,
  loadLogByIdentity: (LogIdentity) => void,
  scrollToLine: (number) => void
} & ContextRouter

export class Fetch extends React.PureComponent<Props> {
  static defaultProps = {
    bookmarks: []
  }

  constructor(props: Props) {
    super(props);
    if (this.props.logIdentity != null) {
      this.props.loadLogByIdentity(this.props.logIdentity);
    }
  }

  setScroll = (lineNum: number) => {
    this.props.scrollToLine(lineNum);
  }

  showLines(): ?ReactNode {
    if (!this.props.lines) {
      return <div />;
    }
    const findLine = this.props.lineData.findResults[this.props.findIdx];
    return (
      <LogView
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
function mapStateToProps(state: ReduxState, ownProps: $Shape<Props>) {
  return {
    ...ownProps,
    lines: selectors.getLogLines(state),
    findIdx: selectors.getLogViewerFindIdx(state),
    bookmarks: selectors.getLogViewerBookmarks(state),
    lineData: selectors.getFilteredLineData(state)
  };
}

function mapDispatchToProps(dispatch: Dispatch<*>, ownProps) {
  return {
    ...ownProps,
    loadLogByIdentity: (identity: LogIdentity) => dispatch(actions.loadLog(identity)),
    scrollToLine: (line: number) => dispatch(actions.scrollToLine(line))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Fetch);
