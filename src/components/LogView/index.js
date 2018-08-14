// @flow strict

import React from 'react';
import ReactList from 'react-list';
import FullLogLine from './FullLogLine';
import { connect } from 'react-redux';
import { scrollToLine, toggleBookmark } from '../../actions';
import * as selectors from '../../selectors';
import type { ReduxState, ColorMap, Line, LineData, Bookmark } from '../../models';

import './style.css';

type Props = {
  searchFindIdx: number,
  bookmarks: Bookmark[],
  wrap: boolean,
  toggleBookmark: (number[]) => void,
  colorMap: ColorMap,
  searchTerm: string,
  caseSensitive: boolean,
  scrollLine: number,
  lineData: LineData,
  highlightLines: Line[],
  highlightText: string[],
  scrollToLine: (number) => void
};

type State = {
  lineMap: Map<number, HTMLSpanElement>,
  selectStartIndex: ?number,
  selectEndIndex: ?number,
  clicks: (number[])[]
};

class LogView extends React.PureComponent<Props, State> {
  logListRef: ?ReactList = null;

  constructor(props) {
    super(props);
    this.state = {
      lineMap: new Map(),
      selectStartIndex: null,
      selectEndIndex: null,
      clicks: []
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

  findBookmark(bookmarkList: Bookmark[], lineNum: number): number {
    return bookmarkList.findIndex(function(bookmark) {
      return bookmark.lineNumber === lineNum;
    });
  }

  genList = (index, key) => {
    return (
      <FullLogLine
        lineRefCallback={this.lineRefCallback}
        key={key}
        found={this.props.lineData.filteredLines[index].lineNumber === this.props.lineData.findResults[this.props.searchFindIdx]}
        bookmarked={this.findBookmark(this.props.bookmarks, this.props.lineData.filteredLines[index].lineNumber) !== -1}
        highlight={this.props.lineData.highlightLines.includes(this.props.lineData.filteredLines[index])}
        wrap={this.props.wrap}
        line={this.props.lineData.filteredLines[index]}
        toggleBookmark={this.props.toggleBookmark}
        colorMap={this.props.colorMap}
        searchTerm={this.props.searchTerm}
        highlightText={this.props.lineData.highlightText}
        caseSensitive={this.props.caseSensitive}
        updateSelectStartIndex={this.updateSelectStartIndex}
        updateSelectEndIndex={this.updateSelectEndIndex}
        handleDoubleClick={this.handleDoubleClick}
      />
    );
  }

  scrollToLine(lineNumber) {
    const visibleIndex = this.props.lineData.indexMap.get(lineNumber);
    console.log(visibleIndex);
    if (visibleIndex === null || visibleIndex === undefined) {
      return;
    }
    let scrollIndex = visibleIndex - 20;
    if (scrollIndex < 0) {
      scrollIndex = 0;
    }
    if (this.logListRef != null) {
      this.logListRef.scrollTo(scrollIndex);

      window.scrollBy(0, -45);
    }
  }

  scrollFindIntoView() {
    const renderedLineNum = this.props.lineData.findResults[this.props.searchFindIdx];
    if (renderedLineNum < 0 || renderedLineNum === undefined || renderedLineNum === null) {
      return;
    }
    const line = this.state.lineMap.get(renderedLineNum);
    this.props.scrollToLine(renderedLineNum);
    if (line == null) {
      return;
    }
    const findElements = line.getElementsByClassName('findResult' + renderedLineNum);
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

  componentDidUpdate(prevProps) {
    if (this.props.scrollLine !== null && this.props.scrollLine >= 0 && this.props.scrollLine !== prevProps.scrollLine) {
      this.scrollToLine(this.props.scrollLine);
    }

    // If the find index changed, scroll to the right if necessary.
    if (this.props.searchFindIdx !== -1 && (this.props.searchFindIdx !== prevProps.searchFindIdx || this.props.searchTerm !== prevProps.searchTerm)) {
      this.scrollFindIntoView();
    }
  }

  render() {
    if (this.props.lineData.filteredLines.length !== 0) {
      return (
        <div>
          <ReactList
            ref={this.setLogListRef}
            itemRenderer={this.genList}
            length={this.props.lineData.filteredLines.length}
            initialIndex={this.props.scrollLine}
            type={this.props.wrap ? 'variable' : 'uniform'}
            useStaticSize={!this.props.wrap}
          />
        </div>
      );
    }
    return (<div></div>);
  }
}

function mapStateToProps(state: ReduxState, ownProps: $Shape<Props>): $Shape<Props> {
  const settings = selectors.getLogViewerSettings(state);
  return {
    ...ownProps,
    colorMap: selectors.getLogColorMap(state),
    caseSensitive: settings.caseSensitive,
    wrap: settings.wrap,
    searchTerm: selectors.getLogViewerSearchTerm(state),
    scrollLine: selectors.getLogViewerScrollLine(state),
    searchFindIdx: selectors.getLogViewerFindIdx(state),
    bookmarks: selectors.getLogViewerBookmarks(state)
  };
}

function mapDispatchToProps(dispatch: Dispatch<*>, ownProps: $Shape<Props>) {
  return {
    ...ownProps,
    toggleBookmark: (bk: number[]) => dispatch(toggleBookmark(bk)),
    scrollToLine: (n: number) => dispatch(scrollToLine(n))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LogView);
