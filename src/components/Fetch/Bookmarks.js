import React from 'react';
import PropTypes from 'prop-types';

export class Bookmarks extends React.PureComponent {
  static propTypes = {
    bookmarks: PropTypes.arrayOf(PropTypes.shape({
      lineNumber: PropTypes.number.isRequired
    })).isRequired,
    setScroll: PropTypes.func.isRequired
  }

  scroll = (event) => {
    if (event.target.innerHTML) {
      this.props.setScroll(parseInt(event.target.innerHTML, 10));
    }
  }

  render() {
    return (
      <div className="bookmarks-bar monospace">
        <div>
          {this.props.bookmarks.map((bookmark) => bookmark(bookmark.lineNumber, this.scroll))}
        </div>
      </div>
    );
  }
}

export const bookmark = (lineNumber, scrollFunc) => {
  return (
    <div onClick={scrollFunc} key={lineNumber}>
      {lineNumber}
    </div>
  );
};
