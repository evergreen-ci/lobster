// @flow strict

import React from 'react';
import Highlighter from 'react-highlight-words';
import type { ColorMap } from '../../models';


type Props = {
  caseSensitive: boolean,
  colorMap: ColorMap,
  find: string,
  lineNumber: number,
  lineRefCallback: (?HTMLSpanElement, number, isUnmount?: boolean) => void,
  port: ?string,
  text: string,
  highlightText: string[]
}

type State = {
  startSelect: boolean,
  endSelect: boolean,
  clicks: number[],
  selectStartIndex: ?number,
  selectEndIndex: ?number,
  scrollLine: ?number
}

export default class LogLineText extends React.Component<Props, State> {
  lineRef: ?HTMLSpanElement = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      startSelect: false,
      endSelect: false,
      clicks: [],
      selectStartIndex: null,
      selectEndIndex: null,
      scrollLine: null
    };
  }

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

  updateHighlightAndFind() {
    const newHighlight = this.props.highlightText.slice();
    newHighlight.push(this.props.find);
    return newHighlight;
  }

  setRef = (element: ?HTMLSpanElement) => {
    this.lineRef = element;
  };

  render() {
    const style = {};
    const highlightAndFind = this.updateHighlightAndFind();
    const highlightStyle = { color: '', 'backgroundImage': 'inherit', 'backgroundColor': 'pink' };
    if (this.props.port != null) {
      style.color = this.props.colorMap[this.props.port];
      highlightStyle.color = this.props.colorMap[this.props.port];
    }
    return (
      <span ref={this.setRef}>
        <Highlighter
          highlightClassName={'findResult' + this.props.lineNumber}
          caseSensitive={this.props.caseSensitive}
          unhighlightStyle={style}
          highlightStyle={highlightStyle}
          textToHighlight={this.props.text}
          searchWords={this.props.highlightText.length === 0 ? [this.props.find] : highlightAndFind}
        />
      </span>
    );
  }
}
