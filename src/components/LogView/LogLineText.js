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
  handleDoubleClick: () => void,
  prettyPrint: boolean,
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

  containsValidJSON(str: string) {
    try {
      return (JSON.parse(str) && !!str);
    } catch (e) {
      return false;
    }
  }

  findJSONObjectsInLine() {
    // Pretty-printing is implemented natively in JSON.stringify(). The third argument enables pretty printing and sets the spacing to use:
    // var str = JSON.stringify(obj, null, 2); // spacing level = 2
    return [];
  }

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

    if (this.props.prettyPrint && this.containsValidJSON(this.props.text)) {
      const lineSplitByJSON = this.findJSONObjectsInLine();
      // note- using a different highlight class name might be problematic for 'find' operation but we'll see
      const blocks = lineSplitByJSON.map((block, index) => {
        <Highlighter
          highlightClassName={'findResult' + this.props.lineNumber + '-block-' + index}
          caseSensitive={this.props.caseSensitive}
          unhighlightStyle={style}
          highlightStyle={highlightStyle}
          textToHighlight={block}
          searchWords={searchWords}
          highlightTag={this.containsValidJSON(block) ? 'pre' : ''}
        />
      });

      return (
        <span ref={this.setRef} onDoubleClick={this.props.handleDoubleClick}>
          {blocks}
        </span>
      );

    } else {
      return (
        <span ref={this.setRef} onDoubleClick={this.props.handleDoubleClick}>
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
}
