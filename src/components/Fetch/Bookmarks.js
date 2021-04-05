// @flow strict

import React from "react";
import { connect } from "react-redux";
import { faArrowCircleLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as actions from "../../actions";
import * as selectors from "../../selectors";
import type {
  ReduxState,
  Bookmark as BookmarkType,
  LogIdentity,
} from "../../models";
import "./style.css";

type Props = {|
  bookmarks: BookmarkType[],
  scrollToLine: (number) => void,
  shareLine: number,
|};

export class Bookmarks extends React.PureComponent<Props> {
  scroll = (event: SyntheticMouseEvent<HTMLInputElement>) => {
    if (event.currentTarget.innerHTML != null) {
      this.props.scrollToLine(parseInt(event.currentTarget.innerHTML, 10));
    }
  };

  render() {
    return (
      <div className="bookmarks-bar monospace">
        <div>
          {this.props.bookmarks.map((bookmark, key) => {
            return (
              <Bookmark
                key={key}
                lineNumber={bookmark.lineNumber}
                scrollFunc={this.scroll}
                emphasize={bookmark.lineNumber === this.props.shareLine}
              />
            );
          })}
        </div>
      </div>
    );
  }
}

export type BookmarkProps = {
  lineNumber: number,
  scrollFunc: (event: SyntheticMouseEvent<HTMLInputElement>) => void,
  emphasize: boolean,
};

export const Bookmark = (props: BookmarkProps) => {
  return (
    <div className="bookmark" onClick={props.scrollFunc} key={props.lineNumber}>
      {props.lineNumber}{" "}
      {props.emphasize && <FontAwesomeIcon icon={faArrowCircleLeft} />}
    </div>
  );
};

function mapStateToProps(state: ReduxState, ownProps: $Shape<Props>) {
  return {
    ...ownProps,
    bookmarks: selectors.getLogViewerBookmarks(state),
    shareLine: selectors.getLogViewerShareLine(state),
  };
}

function mapDispatchToProps(dispatch: Dispatch<*>, ownProps) {
  return {
    ...ownProps,
    loadLogByIdentity: (identity: LogIdentity) =>
      dispatch(actions.loadLog(identity)),
    scrollToLine: (line: number) => dispatch(actions.scrollToLine(line)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Bookmarks);
