// @flow strict

import React from 'react';
import { connect } from 'react-redux';
import * as actions from '../../actions';
import * as selectors from '../../selectors';
import type { ReduxState, Bookmark as BookmarkType, LogIdentity } from '../../models';

type Props = {|
  bookmarks: BookmarkType[],
  scrollToLine: (number) => void
|}

export class Bookmarks extends React.PureComponent<Props> {
  scroll = (event: SyntheticMouseEvent<HTMLInputElement>) => {
    if (event.currentTarget.innerHTML != null) {
      this.props.scrollToLine(parseInt(event.currentTarget.innerHTML, 10));
    }
  }

  render() {
    return (
      <div className="bookmarks-bar monospace">
        <div>
          {this.props.bookmarks.map((bookmark, key) => {
            return (<Bookmark key={key} lineNumber={bookmark.lineNumber} scrollFunc={this.scroll} />);
          })}
        </div>
      </div>
    );
  }
}

export type BookmarkProps = {
  lineNumber: number,
  scrollFunc: (event: SyntheticMouseEvent<HTMLInputElement>) => void
}

export const Bookmark = (props: BookmarkProps) => {
  return (
    <div onClick={props.scrollFunc} key={props.lineNumber}>
      {props.lineNumber}
    </div>
  );
};

function mapStateToProps(state: ReduxState, ownProps: $Shape<Props>) {
  return {
    ...ownProps,
    bookmarks: selectors.getLogViewerBookmarks(state)
  };
}

function mapDispatchToProps(dispatch: Dispatch<*>, ownProps) {
  return {
    ...ownProps,
    loadLogByIdentity: (identity: LogIdentity) => dispatch(actions.loadLog(identity)),
    scrollToLine: (line: number) => dispatch(actions.scrollToLine(line))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Bookmarks);
