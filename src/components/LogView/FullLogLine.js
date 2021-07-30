// @flow strict

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLink, faArrowCircleLeft } from "@fortawesome/free-solid-svg-icons";
import LogLineText from "./LogLineText";
import { connect } from "react-redux";
import LineNumber from "./LineNumber";
import * as actions from "../../actions";
import LogOptions from "./LogOptions";
import queryString from "../../thirdparty/query-string";
import type {
  ReduxState,
  Line,
  ColorMap,
  FilterMatchAnnotation,
} from "src/models";

type Props = {
  isShareLine: boolean,
  bookmarked: boolean,
  caseSensitive: boolean,
  colorMap: ColorMap,
  searchTerm: string,
  startRange: number,
  endRange: number,
  found: boolean,
  highlight: boolean,
  line: Line,
  wrap: boolean,
  lineRefCallback: (
    element: ?HTMLSpanElement,
    line: number,
    isUnmount?: boolean
  ) => void,
  toggleBookmark: (number[]) => void,
  updateSelectStartIndex: (number) => void,
  updateSelectEndIndex: (number) => void,
  highlightText: string[],
  handleDoubleClick: () => void,
  prettyPrint: boolean,
} & FilterMatchAnnotation;

type State = {
  line: Line,
};

class FullLogLine extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      line: props.line,
    };
  }

  handleMouseUp = () => {
    let endIndex = this.props.line.lineNumber;
    const selection = window.getSelection();
    if (selection.type === "Range") {
      const selectionString = selection.toString();
      if (selectionString !== "") {
        const lastTwo = selectionString.substr(-1);
        if (lastTwo === "\n") {
          endIndex = this.props.line.lineNumber - 1;
        }
      }
    }
    this.props.updateSelectEndIndex(endIndex);
  };

  handleMouseDown = () => {
    this.props.updateSelectStartIndex(this.props.line.lineNumber);
  };

  render() {
    let className = "monospace hover-highlight inline";
    if (this.props.bookmarked) {
      className += " bookmark-line";
    }
    if (this.props.isShareLine) {
      className += " tan-background";
    }
    if (!this.props.wrap) {
      className += " no-wrap";
    } else {
      className += " wrap";
    }
    if (this.props.found) {
      className += " highlighted";
    }
    if (this.props.highlight) {
      className += " filtered";
    }
    if (!this.props.line.isMatched) {
      className += " no-match";
    }
    return (
      <div
        style={{ paddingLeft: 5 }}
        className={className}
        onMouseUp={this.handleMouseUp}
        onMouseDown={this.handleMouseDown}
      >
        <FontAwesomeIcon
          onClick={() => {
            const nextHash = queryString.stringify({
              ...queryString.parseUrl(window.location.href.replace("#", "?"))
                .query,
              shareLine: this.props.isShareLine
                ? -1
                : this.props.line.lineNumber,
            });
            window.history.replaceState(
              {},
              "",
              window.location.pathname + "#" + nextHash
            );
            window.dispatchEvent(new HashChangeEvent("hashchange"));
          }}
          style={{ cursor: "pointer" }}
          icon={faLink}
        />
        <LineNumber
          lineNumber={this.props.line.lineNumber}
          toggleBookmark={this.props.toggleBookmark}
          handleDoubleClick={this.props.handleDoubleClick}
        >
          {this.props.isShareLine && (
            <FontAwesomeIcon icon={faArrowCircleLeft} />
          )}
        </LineNumber>

        <LogOptions gitRef={this.props.line.gitRef} />
        <LogLineText
          lineRefCallback={this.props.lineRefCallback}
          text={this.state.line.text}
          lineNumber={this.props.line.lineNumber}
          handleDoubleClick={this.props.handleDoubleClick}
          port={this.props.line.port}
          colorMap={this.props.colorMap}
          searchTerm={this.props.searchTerm}
          startRange={this.props.startRange}
          endRange={this.props.endRange}
          caseSensitive={this.props.caseSensitive}
          highlightText={this.props.highlightText}
          prettyPrint={this.props.prettyPrint && this.props.bookmarked}
        />
      </div>
    );
  }
}

function mapStateToProps(
  state: ReduxState,
  ownProps: $Shape<Props>
): $Shape<Props> {
  return {
    ...ownProps,
  };
}

function mapDispatchToProps(dispatch: Dispatch<*>, ownProps: $Shape<Props>) {
  return {
    ...ownProps,
    loadShareLine: (lineNum: number) =>
      dispatch(actions.loadShareLine(lineNum)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(FullLogLine);
