// @flow strict

import React from "react";

type Props = {
  lineNumber: number,
  handleDoubleClick: () => void,
};

export default class LineNumber extends React.PureComponent<Props> {
  render() {
    const style = { width: "60px", display: "inline-block" };
    return (
      <span
        data-pseudo-content={this.props.lineNumber}
        className="padded-text"
        style={style}
        onDoubleClick={this.props.handleDoubleClick}
      ></span>
    );
  }
}
