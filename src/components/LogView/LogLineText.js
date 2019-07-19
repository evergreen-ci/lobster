// @flow strict

import React from 'react';
import Highlighter from 'react-highlight-words';
import type { ColorMap } from 'src/models';


type Props = {
  caseSensitive: boolean,
  colorMap: ColorMap,
  searchTerm: string,
  startRange: number,
  endRange: number,
  lineNumber: number,
  lineRefCallback: (?HTMLSpanElement, number, isUnmount?: boolean) => void,
  port: ?string,
  text: string,
  highlightText: string[],
}

export default class LogLineText extends React.PureComponent<Props> {
  lineRef: ?HTMLSpanElement = null;

  componentDidUpdate() {
    if (this.lineRef) {
      this.props.lineRefCallback(this.lineRef, this.props.lineNumber);
    }
  }

  componentWillUnmount() {
    if (this.lineRef) {
      this.props.lineRefCallback(this.lineRef, this.props.lineNumber, true);
    }
  }

  setRef = (element: ?HTMLSpanElement) => {
    this.lineRef = element;
  };

  render() {
    const style = {};
    const highlightStyle = { color: '', 'backgroundImage': 'inherit', 'backgroundColor': 'pink' };
    if (this.props.port != null) {
      style.color = this.props.colorMap[this.props.port];
      highlightStyle.color = this.props.colorMap[this.props.port];
    }

    let searchWords = [];
    if (this.props.lineNumber >= this.props.startRange &&
      (this.props.endRange < 0 || this.props.lineNumber <= this.props.endRange)) {
      searchWords = this.props.highlightText;
    }
    return (
      <span ref={this.setRef}>
        <Highlighter
          highlightClassName={'findResult' + this.props.lineNumber}
          caseSensitive={this.props.caseSensitive}
          unhighlightStyle={style}
          highlightStyle={highlightStyle}
          textToHighlight={this.props.text}
          searchWords={searchWords}
        />
      </span>
    );
  }
}
