// @flow strict

import React from "react";

type Props = {
  gitRef: ?string,
};

export default class LogOptions extends React.PureComponent<Props> {
  handleClick = () => {
    if (this.props.gitRef) {
      window.open(this.props.gitRef);
    }
  };

  render() {
    const style = { width: "30px", display: "inline-block" };
    if (this.props.gitRef) {
      return (
        <span
          style={style}
          data-pseudo-content="&nbsp;&#128279;&nbsp;"
          onClick={this.handleClick}
        ></span>
      );
    }
    return <span style={style}></span>;
  }
}
