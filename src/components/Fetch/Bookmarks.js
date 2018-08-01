// @flow strict

import React from 'react';

type lineNumber = {|
  +lineNumber: number
|}

type Props = {|
  bookmarks: lineNumber[],
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
            return (<Bookmark key={key} lineNumber={bookmark.lineNumber} scrollFunc={this.scroll} />);
          })}
        </div>
      </div>
    );
  }
}

type BookmarkProps = {|
  lineNumber: number,
  scrollFunc: (SyntheticMouseEvent<HTMLInputElement>) => void
|}

export const Bookmark = (props: BookmarkProps) => {
  return (
    <div onClick={props.scrollFunc} key={props.lineNumber}>
      {props.lineNumber}
    </div>
  );
};
