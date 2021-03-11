// @flow strict

import React from "react";
import Highlighter from "react-highlight-words";
import type { ColorMap } from "src/models";

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
};

export function findJSONObjectsInLine(text: string): string[] {
  let startIndex = 0;
  let numBraces = 0;
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "{") {
      if (numBraces === 0 && i !== 0) {
        chunks.push(text.substring(startIndex, i));
        startIndex = i;
      }
      numBraces++;
    } else if (text[i] === "}") {
      numBraces--;
      if (numBraces === 0) {
        try {
          const startingLineBreak = startIndex === 0 ? "" : "\n";
          const endingLineBreak = i === text.length - 1 ? "" : "\n";
          const jsonObj = JSON.parse(text.substring(startIndex, i + 1));
          const formattedString =
            startingLineBreak +
            JSON.stringify(jsonObj, null, 2).replace(/"([^"]+)":/g, "$1:") +
            endingLineBreak;
          chunks.push(formattedString);
          startIndex = i + 1;
        } catch (e) {
          chunks.push(text.substring(startIndex, i));
          startIndex = i;
        }
      }
    }
  }
  if (startIndex !== text.length) {
    chunks.push(text.substring(startIndex));
  }
  return chunks;
}

export default class LogLineText extends React.PureComponent<Props> {
  lineRef: ?HTMLSpanElement = null;
  prettyPrintedText: string[] = findJSONObjectsInLine(this.props.text);

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
    const highlightStyle = {
      color: "",
      backgroundImage: "inherit",
      backgroundColor: "pink",
    };
    if (this.props.port != null) {
      style.color = this.props.colorMap[this.props.port];
      highlightStyle.color = this.props.colorMap[this.props.port];
    }

    let searchWords = [];
    if (
      this.props.lineNumber >= this.props.startRange &&
      (this.props.endRange < 0 || this.props.lineNumber <= this.props.endRange)
    ) {
      searchWords = this.props.highlightText;
    }

    if (this.props.prettyPrint && this.prettyPrintedText.length > 1) {
      const blocks = this.prettyPrintedText.map((block, index) => {
        return (
          <Highlighter
            key={this.props.lineNumber + "-block-" + index}
            highlightClassName={"findResult" + this.props.lineNumber}
            caseSensitive={this.props.caseSensitive}
            unhighlightStyle={style}
            highlightStyle={highlightStyle}
            textToHighlight={block}
            searchWords={searchWords}
          />
        );
      });
      return (
        <span
          ref={this.setRef}
          onDoubleClick={this.props.handleDoubleClick}
          style={{ display: "inline-block" }}
        >
          {blocks}
        </span>
      );
    }
    return (
      <span ref={this.setRef} onDoubleClick={this.props.handleDoubleClick}>
        <Highlighter
          highlightClassName={"findResult" + this.props.lineNumber}
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
