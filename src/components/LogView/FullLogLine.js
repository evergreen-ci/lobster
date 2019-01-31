// @flow strict

import React from 'react';
import LogLineText from './LogLineText';
import LineNumber from './LineNumber';
import LogOptions from './LogOptions';
import type { Line, ColorMap, FilterMatchAnnotation } from 'src/models';

type Props = {
  bookmarked: boolean,
  caseSensitive: boolean,
  colorMap: ColorMap,
  searchTerm: string,
  found: boolean,
  highlight: boolean,
  line: Line,
  wrap: boolean,
  lineRefCallback: (element: ?HTMLSpanElement, line: number, isUnmount?: boolean) => void,
  toggleBookmark: (number[]) => void,
  updateSelectStartIndex: (number) => void,
  updateSelectEndIndex: (number) => void,
  highlightText: string[],
  handleDoubleClick: () => void
} & FilterMatchAnnotation;

export default class FullLogLine extends React.PureComponent<Props> {
  handleMouseUp = () => {
    let endIndex = this.props.line.lineNumber;
    const selection = window.getSelection();
    if (selection.type === 'Range') {
      const selectionString = selection.toString();
      if (selectionString !== '') {
        const lastTwo = selectionString.substr(-1);
        if (lastTwo === '\n') {
          endIndex = this.props.line.lineNumber - 1;
        }
      }
    }
    this.props.updateSelectEndIndex(endIndex);
  }

  handleMouseDown = () => {
    this.props.updateSelectStartIndex(this.props.line.lineNumber);
  }

  render() {
    let className = 'monospace hover-highlight inline';
    if (this.props.bookmarked) {
      className += ' bookmark-line';
    }
    if (!this.props.wrap) {
      className += ' no-wrap';
    } else {
      className += ' wrap';
    }
    if (this.props.found) {
      className += ' highlighted';
    }
    if (this.props.highlight) {
      className += ' filtered';
    }
    if (!this.props.line.isMatched) {
      className += ' no-match'
    }
    return (
      <div className={className} onMouseUp={this.handleMouseUp} onMouseDown={this.handleMouseDown} >
        <LineNumber
          lineNumber={this.props.line.lineNumber}
          toggleBookmark={this.props.toggleBookmark}
          handleDoubleClick={this.props.handleDoubleClick}
        />
        <LogOptions gitRef={this.props.line.gitRef} />
        <LogLineText
          lineRefCallback={this.props.lineRefCallback}
          text={this.props.line.text}
          lineNumber={this.props.line.lineNumber}
          port={this.props.line.port}
          colorMap={this.props.colorMap}
          searchTerm={this.props.searchTerm}
          caseSensitive={this.props.caseSensitive}
          highlightText={this.props.highlightText}
        />
      </div>
    );
  }
}
