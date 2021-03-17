// @flow strict

import React from "react";
import ReactList from "react-list";
import FullLogLine from "./FullLogLine";
import ExpandableLogLine from "./ExpandableLogLine";
import { findJSONObjectsInLine } from "./LogLineText";
import { connect } from "react-redux";
import { scrollToLine, toggleBookmark, toggleLineWrap } from "../../actions";
import * as selectors from "../../selectors";
import type {
  ReduxState,
  ColorMap,
  SearchResults,
  HighlightLineData,
  Bookmark,
  Line,
} from "src/models";

import "./style.css";

const MAX_REC_DEPTH = 64; // Should be ok until there < 18446744073709551616 lines

type Props = {
  searchFindIdx: number,
  bookmarks: Bookmark[],
  wrap: boolean,
  expandableRows: boolean,
  colorMap: ColorMap,
  searchTerm: string,
  startRange: number,
  endRange: number,
  caseSensitive: boolean,
  scrollLine: number,
  highlights: HighlightLineData,
  lines: Line[],
  expandableFilterData: Array<Line | number>,
  findResults: SearchResults,
  toggleBookmark: (number[]) => void,
  scrollToLine: (number) => void,
  prettyPrint: boolean,
  toggleWrap: () => void,
};

type SkipLine = {|
  start: number,
  end: number,
  kind: "SkipLine",
|};

// Just a helper
function newSkipLine(start, end): SkipLine {
  return { start: start, end: end, kind: "SkipLine" };
}

type State = {
  hasScrolledToFirstBookmark: boolean,
  selectStartIndex: ?number,
  selectEndIndex: ?number,
  lines: Array<Line | SkipLine>,
  expandedRanges: Array<[number, number]>,
  clicks: number[][],
};

class LogView extends React.Component<Props, State> {
  logListRef: ?ReactList = null;
  lineMap: Map<number, HTMLSpanElement> = new Map();

  constructor(props) {
    super(props);
    this.state = {
      hasScrolledToFirstBookmark: props.bookmarks.length === 0,
      selectStartIndex: null,
      selectEndIndex: null,
      clicks: [],
      lines: this.foldUnmatchedLines(props.lines),
      expandedRanges: [],
    };
  }

  // Use (improved) binary search to find line index by line number
  // :param start: internal (recursion)
  // :param end: internal (recursion)
  // :param depth: internal (recursion) for exceptional cases
  // :returns: index of the item with defined line number
  findLineIdx = (
    // Input parameters
    data: Array<Line | SkipLine>,
    lineNumber: number,
    // Recursion contextual parameteres
    start?: number = 0,
    end?: number = data.length - 1,
    depth?: number = MAX_REC_DEPTH
  ): number => {
    // For rare cases, when the line couldn't be found
    // return expected position
    if (start === end) {
      return start;
    }

    // When max recursion depth reached
    // Should never happen, but in case of bugs it's better
    // than infinite recursion loop
    if (depth < 0) {
      throw new Error("Max depth reached!");
    }

    const midIdx =
      depth === MAX_REC_DEPTH
        ? // First run. Attemtp to guess the index.
          // Use linear proportion for efficient index approximation
          Math.floor((lineNumber * end) / (this.props.lines.length - 1))
        : Math.floor((end - start) / 2) + start; // Middle idx calc
    const midItem = data[midIdx];
    // disjoint union refinement
    if (midItem.kind === "SkipLine") {
      if (midItem.start <= lineNumber && lineNumber <= midItem.end) {
        return midIdx;
      } else if (lineNumber < midItem.start) {
        return this.findLineIdx(data, lineNumber, start, midIdx, depth - 1);
      } else if (lineNumber > midItem.end) {
        return this.findLineIdx(data, lineNumber, midIdx, end, depth - 1);
      }
    } else {
      // kind == 'Line'
      // $FlowFixMe // intersection type issue
      const line: Line = midItem;
      if (line.lineNumber === lineNumber) {
        return midIdx;
      } else if (midIdx === start) {
        // Not found. Exceptional case. Stop iterations
        return midIdx;
      } else if (lineNumber < line.lineNumber) {
        return this.findLineIdx(data, lineNumber, start, midIdx, depth - 1);
      } else if (lineNumber > line.lineNumber) {
        return this.findLineIdx(data, lineNumber, midIdx, end, depth - 1);
      }
    }
    throw new Error(`Line number ${lineNumber} not found!`);
  };

  foldUnmatchedLines(lines: Line[]): Array<Line | SkipLine> {
    // If Expandable Rows settings is inactive completely
    // don't display expandable rows
    if (!this.props.expandableRows) {
      // $FlowFixMe flow is just broken :'(
      return lines.filter((line) => line.isMatched);
    }

    const out: Array<Line | SkipLine> = [];
    let inSkipState = false;
    let skipStart: number = 0;
    const expandedRanges = this.state ? this.state.expandedRanges : [];

    lines.forEach((line) => {
      const lineNo = line.lineNumber;
      let ignoreSkip: boolean = false;

      expandedRanges.forEach((range) => {
        if (range[0] <= lineNo && lineNo <= range[1]) {
          ignoreSkip = true;
        }
      });

      // Triggers when non-matched line appears
      // $FlowFixMe isMatched defined through tye intersection
      if (!ignoreSkip && !inSkipState && !line.isMatched) {
        inSkipState = true;
        skipStart = line.lineNumber;
      }

      // Triggers when matched line appears
      // $FlowFixMe defined through tye intersection
      if (inSkipState && (line.isMatched === true || ignoreSkip)) {
        inSkipState = false;
        out.push(newSkipLine(skipStart, line.lineNumber - 1));
      }

      // When matched line appears
      if (!inSkipState || ignoreSkip) out.push(line);
    });

    // Finalization
    if (inSkipState) {
      out.push(newSkipLine(skipStart, lines.length - 1));
    }

    return out;
  }

  setLogListRef = (element) => {
    this.logListRef = element;
  };

  lineRefCallback = (
    element: ?HTMLSpanElement,
    line: number,
    isUnmount?: boolean
  ): void => {
    if (isUnmount === true) {
      this.lineMap.delete(line);
    } else if (element) {
      this.lineMap.set(line, element);
    }
  };

  updateSelectStartIndex = (index: number) => {
    this.setState({ selectStartIndex: index });
  };

  updateSelectEndIndex = (index: number) => {
    this.setState((state: State) => {
      if (
        state.selectStartIndex === null ||
        state.selectStartIndex === undefined
      ) {
        return state;
      }
      const clickElem = [state.selectStartIndex, index];
      const newClicks = state.clicks.slice();
      newClicks.push(clickElem);
      return { ...state, clicks: newClicks, selectEndIndex: index };
    });
  };

  handleDoubleClick = () => {
    let indexArray = [];
    const lastClick = this.state.clicks[this.state.clicks.length - 1];
    const secondToLastClick = this.state.clicks[this.state.clicks.length - 2];
    if (lastClick && secondToLastClick) {
      // Check if trying to toggle one line
      if (
        lastClick[0] === secondToLastClick[0] &&
        lastClick[1] === secondToLastClick[1]
      ) {
        indexArray.push(lastClick[0]);
      }
      if (this.state.clicks.length > 2) {
        const selectClick = this.state.clicks[this.state.clicks.length - 3];
        if (lastClick[0] >= selectClick[0] && lastClick[1] <= selectClick[1]) {
          indexArray = Array(selectClick[1] - selectClick[0] + 1)
            .fill()
            .map((item, index) => selectClick[0] + index);
        }
      }
      // Call toggle bookmark
      this.props.toggleBookmark(indexArray);
      this.setState({ clicks: [] });
    }
  };

  findBookmark(bookmarkList: Bookmark[], lineNum: number): number {
    return bookmarkList.findIndex(function (bookmark) {
      return bookmark.lineNumber === lineNum;
    });
  }

  // :param ranges: list of 2d tuples
  // The firt number in tuple means start line index, that will be expanded
  // the second is end index
  handleExpand = (ranges: Array<[number, number]>) => {
    // TODO collapse sequential ranges into one
    this.setState((state) => ({
      expandedRanges: state.expandedRanges.concat(ranges),
    }));
  };

  genList = (index: number) => {
    const item = this.state.lines[index];
    // disjoint union refinement
    if (item.kind === "SkipLine") {
      // IF SkipLine
      const skipLine: SkipLine = item;
      return (
        <ExpandableLogLine
          key={skipLine.start}
          start={skipLine.start}
          end={skipLine.end}
          onClick={this.handleExpand}
        />
      );
    } // IF Line
    const line: Line = item;
    return this.genListRegularRow(line, line.lineNumber);
  };

  genListRegularRow = (line, lineNumber: number) => (
    <FullLogLine
      lineRefCallback={this.lineRefCallback}
      // $FlowFixMe
      key={lineNumber + ":" + line.isMatched}
      found={lineNumber === this.props.findResults[this.props.searchFindIdx]}
      bookmarked={this.findBookmark(this.props.bookmarks, lineNumber) !== -1}
      highlight={this.props.highlights.highlightLines.includes(line)}
      wrap={this.props.wrap}
      line={line}
      isMatched={line.isMatched}
      toggleBookmark={this.props.toggleBookmark}
      colorMap={this.props.colorMap}
      searchTerm={this.props.searchTerm}
      startRange={this.props.startRange}
      endRange={this.props.endRange}
      highlightText={this.props.highlights.highlightText}
      caseSensitive={this.props.caseSensitive}
      updateSelectStartIndex={this.updateSelectStartIndex}
      updateSelectEndIndex={this.updateSelectEndIndex}
      handleDoubleClick={this.handleDoubleClick}
      prettyPrint={this.props.prettyPrint}
    />
  );

  getLineHeight = (index: number) => {
    if (
      this.props.prettyPrint &&
      this.findBookmark(this.props.bookmarks, index) !== -1
    ) {
      const line: Line = this.state.lines[index];
      const numBlocks = findJSONObjectsInLine(line.text).length;
      return numBlocks * 20;
    }
    return 20;
  };

  scrollToLine(lineNumber: number) {
    const visibleIndex = this.findLineIdx(this.state.lines, lineNumber);
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
    const renderedLineNum = this.props.findResults[this.props.searchFindIdx];
    if (
      renderedLineNum < 0 ||
      renderedLineNum === undefined ||
      renderedLineNum === null
    ) {
      return;
    }
    const line = this.lineMap.get(renderedLineNum);
    this.props.scrollToLine(renderedLineNum);
    if (line == null) {
      return;
    }
    const findElements = line.getElementsByClassName(
      "findResult" + renderedLineNum
    );
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

  componentDidMount() {
    if (this.props.wrap) {
      this.props.toggleWrap();
    }
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    const currBookmarksSet = new Set(
      this.props.bookmarks.map(({ lineNumber }) => lineNumber)
    );
    const lastLineNo = this.state.lines.length - 1;
    // handle initial bookmark scroll
    if (
      // Don't scroll unless lines are rendered and bookmarks exist
      this.state.lines.length > 0 &&
      prevState.lines.length === 0 &&
      this.props.bookmarks.length > 0 &&
      // Don't scroll when the bookmarks look like [0, last line]
      !(
        currBookmarksSet.size === 2 &&
        currBookmarksSet.has(0) &&
        currBookmarksSet.has(lastLineNo)
      ) &&
      // Don't scroll when we already tried to scroll before lol
      !this.state.hasScrolledToFirstBookmark
    ) {
      const sortedBookmarks = [...this.props.bookmarks].sort(
        (a, b) => a.lineNumber - b.lineNumber
      );
      const { lineNumber } =
        sortedBookmarks.find(({ lineNumber }) => lineNumber !== 0) || {};
      if (lineNumber !== undefined) {
        this.setState({ hasScrolledToFirstBookmark: true }, () => {
          this.props.scrollToLine(lineNumber);
        });
      }
    }

    if (
      this.props.scrollLine !== null &&
      this.props.scrollLine >= 0 &&
      this.props.scrollLine !== prevProps.scrollLine
    ) {
      this.scrollToLine(this.props.scrollLine);
    }

    // If the find index changed, scroll to the right if necessary.
    if (
      this.props.searchFindIdx !== -1 &&
      (this.props.searchFindIdx !== prevProps.searchFindIdx ||
        this.props.searchTerm !== prevProps.searchTerm)
    ) {
      this.scrollFindIntoView();
    }

    if (
      this.props !== prevProps ||
      this.state.expandedRanges !== prevState.expandedRanges
    ) {
      this.setState({
        lines: this.foldUnmatchedLines(this.props.lines),
      });
    }
  }

  render() {
    if (this.state.lines.length !== 0) {
      return (
        <div>
          <ReactList
            ref={this.setLogListRef}
            itemRenderer={this.genList}
            itemSizeEstimator={this.getLineHeight}
            length={this.state.lines.length}
            initialIndex={this.props.scrollLine}
            type={"variable"}
            useStaticSize={false}
          />
        </div>
      );
    }
    return <div></div>;
  }
}

function mapStateToProps(
  state: ReduxState,
  ownProps: $Shape<Props>
): $Shape<Props> {
  const settings = selectors.getLogViewerSettings(state);
  const lines = selectors.getFilteredLineData(state);
  return {
    ...ownProps,
    colorMap: selectors.getLogColorMap(state),
    caseSensitive: settings.caseSensitive,
    wrap: settings.wrap,
    expandableRows: settings.expandableRows,
    prettyPrint: settings.prettyPrint,
    searchTerm: selectors.getLogViewerSearchTerm(state),
    startRange: selectors.getLogViewerSearchStartRange(state),
    endRange: selectors.getLogViewerSearchEndRange(state),
    scrollLine: selectors.getLogViewerScrollLine(state),
    searchFindIdx: selectors.getLogViewerFindIdx(state),
    bookmarks: selectors.getLogViewerBookmarks(state),
    highlights: selectors.getHighlights(state),
    lines: lines,
    findResults: selectors.getFindResults(state),
    expandableFilterData: [],
  };
}

function mapDispatchToProps(dispatch: Dispatch<*>, ownProps: $Shape<Props>) {
  return {
    ...ownProps,
    scrollToLine: (n: number) => dispatch(scrollToLine(n)),
    toggleBookmark: (bk: number[]) => dispatch(toggleBookmark(bk)),
    toggleWrap: () => dispatch(toggleLineWrap()),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LogView);
