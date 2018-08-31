// @flow strict

import React from 'react';
import ReactList from 'react-list';
import FullLogLine from './FullLogLine';
import { connect } from 'react-redux';
import * as actions from '../../actions';
import * as selectors from '../../selectors';
import type { ReduxState, ColorMap, SearchResults, HighlightLineData, FilteredLineData, Bookmark } from '../../models';

import './style.css';

type Props = {
  searchFindIdx: number,
  bookmarks: Bookmark[],
  wrap: boolean,
  colorMap: ColorMap,
  searchTerm: string,
  caseSensitive: boolean,
  scrollLine: number,
  highlights: HighlightLineData,
  filterData: FilteredLineData,
  findResults: SearchResults,
  toggleBookmark: (number[]) => void,
  scrollToLine: (number) => void,
  clearLineList: () => void,
  addLine: (line: number, text: string) => void
};

type State = {
  selectStartIndex: ?number,
  selectEndIndex: ?number,
  clicks: (number[])[]
};

class LogView extends React.Component<Props, State> {
  logListRef: ?ReactList = null;
  lineMap: Map<number, HTMLSpanElement> = new Map();

  constructor(props) {
    super(props);
    this.state = {
      selectStartIndex: null,
      selectEndIndex: null,
      clicks: []
    };
  }

  shouldComponentUpdate(nextProps) {
    if (this.props.bookmarks !== nextProps.bookmarks) {
      return true;
    }
    if (this.props.searchTerm !== nextProps.searchTerm) {
      return true;
    }
    if (this.props.caseSensitive !== nextProps.caseSensitive) {
      return true;
    }
    if (this.props.scrollLine !== nextProps.scrollLine) {
      return true;
    }
    if (this.props.highlights !== nextProps.highlights) {
      return true;
    }
    if (this.props.filterData !== nextProps.filterData) {
      return true;
    }
    if (this.props.findResults !== nextProps.findResults) {
      return true;
    }
    if (this.props.wrap !== nextProps.wrap) {
      return true;
    }
    if (this.props.searchFindIdx !== nextProps.searchFindIdx) {
      return true;
    }

    return false;
  }

  setLogListRef = (element) => {
    this.logListRef = element;
    this.lineViewHandler();
  };

  lineRefCallback = (element: ?HTMLSpanElement, line: number, isUnmount?: boolean): void => {
    if (isUnmount === true) {
      this.lineMap.delete(line);
    } else if (element) {
      this.lineMap.set(line, element);
    }
  };

  updateSelectStartIndex = (index: number) => {
    this.setState({ selectStartIndex: index });
  }

  updateSelectEndIndex = (index: number) => {
    this.setState((state: State) => {
      if (state.selectStartIndex === null || state.selectStartIndex === undefined) {
        return state;
      }
      const clickElem = [state.selectStartIndex, index];
      const newClicks = state.clicks.slice();
      newClicks.push(clickElem);
      return { ...state, clicks: newClicks, selectEndIndex: index };
    });
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

  genList = (index) => {
    const line = this.props.filterData.filteredLines[index];
    const lineNumber = line.lineNumber;
    return (
      <FullLogLine
        lineRefCallback={this.lineRefCallback}
        key={lineNumber}
        found={lineNumber === this.props.findResults[this.props.searchFindIdx]}
        bookmarked={this.findBookmark(this.props.bookmarks, lineNumber) !== -1}
        highlight={this.props.highlights.highlightLines.includes(line)}
        wrap={this.props.wrap}
        line={line}
        toggleBookmark={this.props.toggleBookmark}
        colorMap={this.props.colorMap}
        searchTerm={this.props.searchTerm}
        highlightText={this.props.highlights.highlightText}
        caseSensitive={this.props.caseSensitive}
        updateSelectStartIndex={this.updateSelectStartIndex}
        updateSelectEndIndex={this.updateSelectEndIndex}
        handleDoubleClick={this.handleDoubleClick}
        addLine={this.props.addLine}
        scrollLine={this.props.scrollLine}
      />
    );
  }

  scrollToLine(lineNumber: number) {
    const visibleIndex = this.props.filterData.indexMap.get(lineNumber);
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

  componentDidMount() {
    window.addEventListener('scroll', this.lineViewHandler);
  }
  componentWillUnmount() {
    window.removeEventListener('scroll', this.lineViewHandler);
  }

  scrollFindIntoView() {
    const renderedLineNum = this.props.findResults[this.props.searchFindIdx];
    if (renderedLineNum < 0 || renderedLineNum === undefined || renderedLineNum === null) {
      return;
    }
    const line = this.lineMap.get(renderedLineNum);
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

  componentDidUpdate(prevProps: Props) {
    if (this.props.scrollLine !== null && this.props.scrollLine >= 0 && this.props.scrollLine !== prevProps.scrollLine) {
      this.scrollToLine(this.props.scrollLine);
    }

    // If the find index changed, scroll to the right if necessary.
    if (this.props.searchFindIdx !== -1 && (this.props.searchFindIdx !== prevProps.searchFindIdx || this.props.searchTerm !== prevProps.searchTerm)) {
      this.scrollFindIntoView();
    }
  }

  lineViewHandler = () => {
    console.log('scrolling');
    if (this.logListRef) {
      const visibleRange = this.logListRef.getVisibleRange();
      console.log(this.logListRef);
      this.props.clearLineList();
      const start = visibleRange[0];
      const end = visibleRange[1];
      console.log(start);
      console.log(end);
      if (start && end) {
        this.props.addLine(this.props.lineData.filteredLines[start].lineNumber, this.props.lineData.filteredLines[start].text);
        this.props.addLine(this.props.lineData.filteredLines[end].lineNumber, this.props.lineData.filteredLines[end].text);
      } else {
        this.props.addLine(this.props.lineData.filteredLines[this.logListRef.state.from].lineNumber, this.props.lineData.filteredLines[this.logListRef.state.from].text);
        this.props.addLine(this.props.lineData.filteredLines[this.logListRef.state.size].lineNumber, this.props.lineData.filteredLines[this.logListRef.state.size].text);
      }
    }
  }

  render() {
    if (this.props.filterData.filteredLines.length !== 0) {
      return (
        <div>
          <ReactList
            ref={this.setLogListRef}
            itemRenderer={this.genList}
            length={this.props.filterData.filteredLines.length}
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
    bookmarks: selectors.getLogViewerBookmarks(state),
    highlights: selectors.getHighlights(state),
    filterData: selectors.getFilteredLineData(state),
    findResults: selectors.getFindResults(state)
  };
}

function mapDispatchToProps(dispatch: Dispatch<*>, ownProps: $Shape<Props>) {
  return {
    ...ownProps,
    clearLineList: () => dispatch(actions.clearLineList()),
    addLine: (line, text) => dispatch(actions.addLine(line, text)),
    toggleBookmark: (bk: number[]) => dispatch(actions.toggleBookmark(bk)),
    scrollToLine: (n: number) => dispatch(actions.scrollToLine(n))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LogView);
