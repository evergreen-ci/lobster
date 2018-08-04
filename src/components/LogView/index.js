// @flow strict

import React from 'react';
import ReactList from 'react-list';
import FullLogLine from './FullLogLine';
import { connect } from 'react-redux';
import type { ColorMap, Line, Bookmark } from '../../models';

import './style.css';

type Props = {
  findBookmark: (Bookmark[], number) => void,
  findLine: number,
  bookmarks: Bookmark[],
  wrap: boolean,
  toggleBookmark: (number[]) => void,
  colorMap: ColorMap,
  find: string,
  caseSensitive: boolean,
  scrollLine: number,
  lines: Line[],
  filter: RegExp[],
  inverseFilter: RegExp[],
  highlight: RegExp[],
  highlightText: string[],
  highlightLine: RegExp[],
  shouldPrintLine: (bookmarks: Bookmark[], line: Line, filter: RegExp[], inverseFilter: RegExp[]) => boolean,
  shouldHighlightLine: (line: Line, highlight: RegExp[], highlightLine: RegExp[]) => boolean
};

type State = {
  processed: string,
  lineMap: Map<number, HTMLSpanElement>,
  selectStartIndex: ?number,
  selectEndIndex: ?number,
  clicks: (number[])[],
  scrollLine: ?number
};

class LogView extends React.Component<Props, State> {
  filteredLines: Line[] = [];
  highlightLines: Line[] = [];
  logListRef: ?ReactList = null;
  indexMap: { [number]: number }

  constructor(props) {
    super(props);
    this.state = {
      processed: '',
      lineMap: new Map(),
      selectStartIndex: null,
      selectEndIndex: null,
      clicks: [],
      scrollLine: null
    };
  }

  setLogListRef = (element) => {
    this.logListRef = element;
  };

  lineRefCallback = (element: ?HTMLSpanElement, line: number, isUnmount?: boolean): void => {
    if (isUnmount === true) {
      this.state.lineMap.delete(line);
    } else if (element) {
      this.state.lineMap.set(line, element);
      if (this.state.scrollLine != null && line === this.state.scrollLine) {
        this.scrollFindIntoView();
      }
    }
  };

  updateSelectStartIndex = (index: number) => {
    this.setState({ selectStartIndex: index });
  }

  updateSelectEndIndex = (index: number) => {
    const newClicks = this.state.clicks.slice();
    if (this.state.selectStartIndex === null || this.state.selectStartIndex === undefined) {
      return;
    }
    const clickElem = [this.state.selectStartIndex, index];
    newClicks.push(clickElem);
    this.setState({ clicks: newClicks, selectEndIndex: index });
  }

  handleDoubleClick = () => {
    let indexArray = [];
    const lastClick = this.state.clicks[this.state.clicks.length - 1];
    const secondToLastClick = this.state.clicks[this.state.clicks.length - 2];
    if (lastClick && secondToLastClick) {
      // Check if trying to toggle one line
      if (lastClick[0] === secondToLastClick[0] && lastClick[1] === secondToLastClick[1]) {
        indexArray.push(lastClick[0]);
      } if (this.state.clicks.length > 2) {
        const selectClick = this.state.clicks[this.state.clicks.length - 3];
        if (lastClick[0] >= selectClick[0] && lastClick[1] <= selectClick[1]) {
          indexArray = Array(selectClick[1] - selectClick[0] + 1).fill().map((item, index) => selectClick[0] + index);
        }
      }
      // Call toggle bookmark
      this.props.toggleBookmark(indexArray);
      this.setState({ clicks: [] });
    }
  }

  genList = (index, key) => {
    return (
      <FullLogLine
        lineRefCallback={this.lineRefCallback}
        key={key}
        found={this.filteredLines[index].lineNumber === this.props.findLine}
        bookmarked={this.props.findBookmark(this.props.bookmarks, this.filteredLines[index].lineNumber) !== -1}
        highlight={this.highlightLines.includes(this.filteredLines[index])}
        wrap={this.props.wrap}
        line={this.filteredLines[index]}
        toggleBookmark={this.props.toggleBookmark}
        colorMap={this.props.colorMap}
        find={this.props.find}
        highlightText={this.props.highlightText}
        caseSensitive={this.props.caseSensitive}
        updateSelectStartIndex={this.updateSelectStartIndex}
        updateSelectEndIndex={this.updateSelectEndIndex}
        handleDoubleClick={this.handleDoubleClick}
      />
    );
  }

  scrollToLine(lineNumber) {
    let scrollIndex = this.indexMap[lineNumber] - 20;
    if (scrollIndex < 0) {
      scrollIndex = 0;
    }
    if (this.logListRef != null) {
      this.logListRef.scrollTo(scrollIndex);

      window.scrollBy(0, -45);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.scrollLine !== null && nextProps.scrollLine >= 0 &&
        this.props.scrollLine !== nextProps.scrollLine) {
      this.scrollToLine(nextProps.scrollLine);
    }

    if (nextProps.lines !== this.props.lines) {
      return true;
    }
    if (nextProps.bookmarks !== this.props.bookmarks) {
      return true;
    }
    if (nextProps.filter !== this.props.filter) {
      return true;
    }
    if (nextProps.inverseFilter !== this.props.inverseFilter) {
      return true;
    }
    if (nextProps.find !== this.props.find) {
      return true;
    }
    if (nextProps.findLine !== this.props.findLine) {
      return true;
    }
    if (nextProps.wrap !== this.props.wrap) {
      return true;
    }
    if (nextProps.caseSensitive !== this.props.caseSensitive) {
      return true;
    }
    if (nextState.clicks !== this.state.clicks) {
      return true;
    }
    if (nextProps.highlight !== this.props.highlight) {
      return true;
    }

    return false;
  }

  scrollFindIntoView() {
    if (this.props.findLine < 0 || !(this.props.findLine in this.state.lineMap)) {
      if (this.props.findLine >= 0) {
        this.setState({ scrollLine: this.props.findLine });
      }
      return;
    }
    // console.log(this.props.findLine);
    const line = this.state.lineMap.get(this.props.findLine);
    if (line == null) {
      return;
    }
    const findElements = line.getElementsByClassName('findResult' + this.props.findLine);
    if (findElements.length > 0) {
      const elem = findElements[0];
      const position = elem.getBoundingClientRect();
      const windowWidth = window.innerWidth;

      let scrollX = window.scrollX;
      const scrollY = window.scrollY; // Account for header
      if (position.right > windowWidth) {
        // Scroll so the leftmost part of the component is 2/3 of the way into the screen.
        scrollX = position.left - windowWidth / 3;
      }
      window.scrollTo(scrollX, scrollY);
    }
  }

  componentDidUpdate(prevProps, _prevState) {
    if (this.props.scrollLine !== null && this.props.scrollLine >= 0 && this.props.scrollLine !== prevProps.scrollLine) {
      this.scrollToLine(this.props.scrollLine);
    }

    // If the find index changed, scroll to the right if necessary.
    if (this.props.findLine !== prevProps.findLine || this.props.find !== prevProps.find) {
      this.scrollFindIntoView();
    }
  }

  render() {
    let j = 0;
    this.indexMap = new Map();
    this.highlightLines = [];
    this.filteredLines = this.props.lines.filter((line, i) => {
      if (!this.props.shouldPrintLine(this.props.bookmarks, line, this.props.filter, this.props.inverseFilter)) {
        return false;
      }
      this.indexMap[i] = j++;
      if (this.props.highlight.length > 0
        && this.props.shouldHighlightLine(line, this.props.highlight, this.props.highlightLine)) {
        this.highlightLines.push(line);
      }
      return true;
    });
    if (this.filteredLines.length !== 0) {
      return (
        <div>
          <ReactList
            ref={this.setLogListRef}
            itemRenderer={this.genList}
            length={this.filteredLines.length}
            initialIndex={this.props.scrollLine}
            type={this.props.wrap ? 'variable' : 'uniform'}
            useStaticSize={true}
          />
        </div>
      );
    }
    return (<div></div>);
  }
}

function mapStateToProps(state, ownProps) {
  return { ...state, ...ownProps,
    colorMap: state.log.colorMap, lines: state.log.lines,
    caseSensitive: state.settings.caseSensitive,
    wrap: state.settings.wrap,
    find: state.find.searchRegex
  };
}

export default connect(mapStateToProps)(LogView);
