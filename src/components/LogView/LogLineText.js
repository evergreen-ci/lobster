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

export function findJSONObjectsInLine(text: string) {
  var startIndex = 0;
  var numBraces = 0;
  var chunks = [];
  for (var i = 0; i < text.length; i++) {
    if (text[i] === '{') {
      if (numBraces === 0 && i !== 0) {
        const lineBreak = (startIndex === 0) ? '' : '\n';
        chunks.push(lineBreak + text.substring(startIndex, i));
        startIndex = i;
      }
      numBraces++;
    } else if (text[i] === '}') {
      numBraces--;
      if (numBraces === 0) {
        try {
          const lineBreak = (startIndex === 0) ? '' : '\n';
          const jsonObj = JSON.parse(text.substring(startIndex, i + 1));
          const formattedString = lineBreak + JSON.stringify(jsonObj, null, 2).replace(/"([^"]+)":/g, '$1:');
          chunks.push(formattedString);
          startIndex = i + 1;
          console.log('this time it works!')
        } catch (e) {
          console.log('this always happens on first attempt to parse, for some reason');
        }
      }
    }
  }
  if (startIndex !== text.length) {
    chunks.push('\n' + text.substring(startIndex));
  }
  return chunks;
}

export default class LogLineText extends React.PureComponent<Props> {
  lineRef: ?HTMLSpanElement = null;
  prettyPrintedText: ?string[] = [];

  componentDidMount() {
    this.prettyPrintedText = findJSONObjectsInLine(this.props.text);
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

    if (this.props.prettyPrint && this.prettyPrintedText && this.prettyPrintedText.length > 1) {
        const blocks = this.prettyPrintedText.map((block, index) => {
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
  }
}
