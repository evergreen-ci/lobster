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
    var startIndex = 0;
    var numBraces = 0;
    var chunks = [];
    for (var i = 0; i < this.props.text.length; i++) {
      if (this.props.text[i] === '{') {
        if (numBraces === 0) {
          chunks.push(this.props.text.substring(startIndex, i));
          startIndex = i;
        }
        numBraces++;
      } else if (this.props.text[i] === '}') {
        numBraces--;
        if (numBraces === 0) {
          try {
            const jsonObj = JSON.parse(this.props.text.substring(startIndex, i + 1));
            const formattedString = '\n' + JSON.stringify(jsonObj, null, 2);
            chunks.push(formattedString);
            startIndex = i + 1;
          } catch (e) {
            console.log('this always happens on first attempt to parse, for some reason');
          }
        }
      }
    }
    chunks.push(this.props.text.substring(startIndex));
    return chunks;
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

    if (this.props.prettyPrint) {
      const lineSplitByJSON = this.findJSONObjectsInLine();
      // note- using a different highlight class name might be problematic for 'find' operation but we'll see
      if (lineSplitByJSON.length > 1) {
        const blocks = lineSplitByJSON.map((block, index) => {
          return (
            <Highlighter
              key={'findResult' + this.props.lineNumber + '-block-' + index}
              highlightClassName={'findResult' + this.props.lineNumber}
              caseSensitive={this.props.caseSensitive}
              unhighlightStyle={style}
              highlightStyle={highlightStyle}
              textToHighlight={block}
              searchWords={searchWords}
              highlightTag={'pre'}
            />
          );
        });

        return (
          <span ref={this.setRef} onDoubleClick={this.props.handleDoubleClick} style={{ display: 'inline-block' }}>
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
