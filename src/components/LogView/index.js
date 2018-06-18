import React from 'react';
import ReactList from 'react-list';
import Highlighter from 'react-highlight-words';
import PropTypes from 'prop-types';

import './style.css';


class LogLineText extends React.Component {
  static propTypes = {
    caseSensitive: PropTypes.bool,
    colorMap: PropTypes.object,
    find: PropTypes.string,
    lineNumber: PropTypes.number,
    lineRefCallback: PropTypes.func,
    port: PropTypes.string,
    text: PropTypes.string
  };

  constructor(props) {
    super(props);
    this.state = {
      startSelect: false,
      endSelect: false
    };
    this.lineRef = null;
    this.setRef = element => {
      this.lineRef = element;
    };
  }

  componentDidMount() {
    if (this.lineRef) {
      this.props.lineRefCallback(this.lineRef, this.props.lineNumber);
    }
  }

  componentWillUnmount() {
    if (this.lineRef) {
      this.props.lineRefCallback(this.lineRef, this.props.lineNumber, true);
    }
  }

  render() {
    const style = {color: this.props.colorMap[this.props.port]};
    const highlightStyle = {color: this.props.colorMap[this.props.port], 'backgroundImage': 'inherit', 'backgroundColor': 'pink'};
    return (
      <span ref={this.setRef}>
        <Highlighter
          highlightClassName={'findResult' + this.props.lineNumber}
          caseSensitive={this.props.caseSensitive}
          unhighlightStyle={style}
          highlightStyle={highlightStyle}
          textToHighlight={this.props.text}
          searchWords={[this.props.find]}
        />
      </span>
    );
  }
}

class LineNumber extends React.Component {
  static propTypes = {
    toggleBookmark: PropTypes.func,
    lineNumber: PropTypes.number
  };

  constructor(props) {
    super(props);
    this.state = {};
    /*
    this.handleDoubleClick = () => {
      this.props.toggleBookmark(this.props.lineNumber);
    };
    */
  }

  render() {
    const style = {width: '60px', display: 'inline-block'};
    // return <span data-pseudo-content={this.props.lineNumber} className="padded-text" style={style} onDoubleClick={this.handleDoubleClick}></span>;
    return <span data-pseudo-content={this.props.lineNumber} className="padded-text" style={style}></span>;
  }
}

class LogOptions extends React.Component {
  static propTypes = {
    gitRef: PropTypes.string
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  handleClick = () => {
    if (this.props.gitRef) {
      window.open(this.props.gitRef);
    }
  }

  render() {
    const style = {width: '30px', display: 'inline-block'};
    if (this.props.gitRef) {
      return <span style={style} data-pseudo-content="&nbsp;&#128279;&nbsp;" onClick={this.handleClick}></span>;
    }
    return <span style={style}></span>;
  }
}

class FullLogLine extends React.Component {
  static propTypes = {
    bookmarked: PropTypes.bool,
    caseSensitive: PropTypes.bool,
    colorMap: PropTypes.object,
    find: PropTypes.string.isRequired,
    found: PropTypes.bool.isRequired,
    line: PropTypes.shape({
      gitRef: PropTypes.string,
      lineNumber: PropTypes.number,
      port: PropTypes.string,
      text: PropTypes.string
    }),
    lineRefCallback: PropTypes.func,
    toggleBookmark: PropTypes.func,
    wrap: PropTypes.bool,
    updateSelectStartIndex: PropTypes.func,
    updateSelectEndIndex: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  handleMouseUp = () => {
    let endIndex = this.props.line.lineNumber;
    if (window.getSelection().toString() !== '') {
      const arrayText = window.getSelection().toString().split('\n');
      if (arrayText[arrayText.length - 1] === '') {
        endIndex = this.props.line.lineNumber - 1;
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

    return (
      <div className={className} onMouseUp={this.handleMouseUp} onMouseDown={this.handleMouseDown}>
        <LineNumber lineNumber={this.props.line.lineNumber} toggleBookmark={this.props.toggleBookmark} />
        <LogOptions gitRef={this.props.line.gitRef} />
        <LogLineText lineRefCallback={this.props.lineRefCallback} text={this.props.line.text} lineNumber={this.props.line.lineNumber} port={this.props.line.port} colorMap={this.props.colorMap} find={this.props.find} caseSensitive={this.props.caseSensitive} />
      </div>
    );
  }
}

class LogView extends React.Component {
  static propTypes = {
    findBookmark: PropTypes.func,
    findLine: PropTypes.number,
    bookmarks: PropTypes.array,
    wrap: PropTypes.bool,
    toggleBookmark: PropTypes.func,
    colorMap: PropTypes.object,
    find: PropTypes.string,
    caseSensitive: PropTypes.bool,
    scrollLine: PropTypes.number,
    lines: PropTypes.array,
    filter: PropTypes.array,
    inverseFilter: PropTypes.array,
    shouldPrintLine: PropTypes.func
  };
  constructor(props) {
    super(props);
    this.state = {
      processed: '',
      lineMap: new Map(),
      selectStartIndex: null,
      selectEndIndex: null,
      clicks: []
    };
    this.logListRef = null;
    this.indexMap = {};
    this.setLogListRef = element => {
      this.logListRef = element;
    };
    this.lineRefCallback = (element, line, isUnmount) => {
      if (isUnmount === true) {
        this.state.lineMap.delete(line);
      } else {
        this.state.lineMap[line] = element;
      }
    };
    this.filteredLines = [];
  }

  updateSelectStartIndex = (index) => {
    console.log('start: ' + index);
    this.setState({selectStartIndex: index});
  }

  updateSelectEndIndex = (index) => {
    console.log('end: ' + index);
    this.setState({selectEndIndex: index});
    const newClicks = this.state.clicks.slice();
    const clickElem = [this.state.selectStartIndex, index];
    newClicks.push(clickElem);
    this.setState({clicks: newClicks});
  }

  handleDoubleClick = () => {
    let indexArray = [];
    const lastClick = this.state.clicks[this.state.clicks.length - 1];
    const secondToLastClick = this.state.clicks[this.state.clicks.length - 2];
    // Check if trying to toggle one line
    if (lastClick[0] === secondToLastClick[0] && lastClick[1] === secondToLastClick[1]) {
      indexArray.push(lastClick[0]);
    } else if (this.state.clicks.length > 2) {
      const selectClick = this.state.clicks[this.state.clicks.length - 3];
      indexArray = Array(selectClick[1] - selectClick[0] + 1).fill().map((item, index) => selectClick[0] + index);
    }
    // Call toggle bookmark
    console.log(indexArray);
    this.props.toggleBookmark(indexArray);
    this.setState({clicks: []});
  }

  genList = (index, key) => {
    return (
      <FullLogLine
        lineRefCallback={this.lineRefCallback}
        key={key}
        found={this.filteredLines[index].lineNumber === this.props.findLine}
        bookmarked={this.props.findBookmark(this.props.bookmarks, this.filteredLines[index].lineNumber) !== -1}
        wrap={this.props.wrap}
        line={this.filteredLines[index]}
        toggleBookmark={this.props.toggleBookmark}
        colorMap={this.props.colorMap}
        find={this.props.find}
        caseSensitive={this.props.caseSensitive}
        updateSelectStartIndex={this.updateSelectStartIndex}
        updateSelectEndIndex={this.updateSelectEndIndex}
      />
    );
  }

  scrollToLine(lineNumber) {
    let scrollIndex = this.indexMap[lineNumber] - 20;
    if (scrollIndex < 0) {
      scrollIndex = 0;
    }
    this.logListRef.scrollTo(scrollIndex);

    window.scrollBy(0, -45);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.scrollLine !== null && nextProps.scrollLine >= 0) {
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

    return false;
  }

  scrollFindIntoView() {
    if (this.props.findLine < 0 || !(this.props.findLine in this.state.lineMap)) {
      return;
    }
    const findElements = this.state.lineMap[this.props.findLine]
      .getElementsByClassName('findResult' + this.props.findLine);
    if (findElements.length > 0) {
      const elem = findElements[0];
      const position = elem.getBoundingClientRect();
      const windowWidth = window.innerWidth;

      let scrollX = window.scrollX;
      const scrollY = window.scrollY - 45; // Account for header

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
    this.indexMap = {};

    this.filteredLines = this.props.lines.filter((line, i) => {
      if (!this.props.shouldPrintLine(this.props.bookmarks, line, this.props.filter, this.props.inverseFilter)) {
        return false;
      }
      this.indexMap[i] = j++;
      return true;
    });
    if (this.filteredLines.length !== 0) {
      return (
        <div onDoubleClick={this.handleDoubleClick}>
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
export default LogView;
