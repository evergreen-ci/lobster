// @flow strict

import React from 'react';
import type { Bookmark } from '../../models';

type Props = {|
  bookmarks: Bookmark[],
  setScroll: (number) => void
|}

export class Bookmarks extends React.PureComponent<Props> {
  scroll = (event: SyntheticMouseEvent<HTMLInputElement>) => {
    if (event.currentTarget.innerHTML != null) {
      this.props.setScroll(parseInt(event.currentTarget.innerHTML, 10));
    }
  }

  render() {
    return (
      <div className="bookmarks-bar monospace">
        <div>
          {this.props.bookmarks.map((bookmark, key) => {
            return (<BookmarkWithScroll key={key} lineNumber={bookmark.lineNumber} scrollFunc={this.scroll} />);
          })}
        </div>
      </div>
    );
  }
}

export const BookmarkWithScroll = (props: Bookmark) => {
  return (
    <div onClick={props.scrollFunc} key={props.lineNumber}>
      {props.lineNumber}
    </div>
  );
};
