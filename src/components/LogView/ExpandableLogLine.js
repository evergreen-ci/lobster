// @flow strict

import React from "react";

type Props = {
  start: number,
  end: number,
  onClick: (Array<[number, number]>) => void,
};

export default class ExpandableLogLine extends React.PureComponent<Props> {
  expandRange = (count: number) => () => {
    const skipped = this.props.end - this.props.start + 1;

    this.props.onClick(
      count * 2 < skipped
        ? // Expand 2 ranges (before and after the exoand line)
          [
            [this.props.start, this.props.start + count - 1],
            [this.props.end - count + 1, this.props.end],
          ]
        : // Expand 1 range (aka expand all)
          [[this.props.start, this.props.end]]
    );
  };

  render() {
    const skipped = this.props.end - this.props.start + 1;
    return (
      <div className="expandable-container">
        <span className="expandable">⬍ ~ ~ ~</span>
        <span className="expandable-selectable">
          {skipped} line{skipped > 1 ? "s" : ""} skipped.
        </span>
        <span className="expandable">
          Expand:&nbsp;
          <a onClick={this.expandRange(skipped)}>All</a>
          ,&nbsp;
          <a onClick={this.expandRange(5)}>Five</a>&nbsp; ~ ~ ~
        </span>
      </div>
    );
  }
}
