import React from 'react';


import './style.css';
import ReactList from 'react-list';
import Highlighter from 'react-highlight-words';


class LogLineText extends React.Component {
    constructor(props){
        super(props);
        this.state = {
        };
    }

    render() {
        let style = {color: this.props.colorMap[this.props.port]};
        let highlightStyle = {color: this.props.colorMap[this.props.port], 'background-image': 'inherit', 'background-color': 'pink'};
        return <Highlighter highlightClassName={'findResult' + this.props.lineNumber} caseSensitive={this.props.caseSensitive} unhighlightStyle={style} highlightStyle={highlightStyle} textToHighlight={this.props.text} searchWords={[this.props.find]} />;
    }

}

class LineNumber extends React.Component {
    constructor(props){
        super(props);
        this.state = {
        };
    }

    handleDoubleClick() {
        this.props.toggleBookmark(this.props.lineNumber);
    }

    render() {
        let style = {width: "60px", display:"inline-block"};
         return <span className="padded-text no-select" style={style}  onDoubleClick={this.handleDoubleClick.bind(this)}>{this.props.lineNumber}</span>;
    }

}

class LogOptions extends React.Component {
    constructor(props){
        super(props);
        this.state = {
        };
    }

    handleClick(gitRef) {
        if (gitRef) {
            window.open(gitRef);
        }
    }
    
    render() {
        let style = {width: "30px", display:"inline-block"};
        let classStr = "no-select";
        if(this.props.gitRef) {
            return<span style={style} className={classStr} onClick={this.handleClick.bind(this, this.props.gitRef)}>&nbsp;&#128279;&nbsp;</span>;
        }
        return <span style={style} className={classStr} ></span>;
    }

}

class FullLogLine extends React.Component {
    constructor(props){
        super(props);
        this.state = {
        };
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

        return (<div key={this.props.key} className={className}><LineNumber lineNumber={this.props.line.lineNumber} toggleBookmark={this.props.toggleBookmark} /> <LogOptions gitRef={this.props.line.gitRef} /> <LogLineText text={this.props.line.text} lineNumber={this.props.line.lineNumber} port={this.props.line.port} colorMap={this.props.colorMap} find={this.props.find} caseSensitive={this.props.caseSensitive}/></div>);
    }

}

class LogView extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            processed: '',
            dummyCounter: 0,
        };
        this.indexMap= {};
    }

    genList(filteredLines) {
        let list =  (
          <ReactList
            ref="logList"
            itemRenderer={(index, key) => (<FullLogLine key={key} found={filteredLines[index].lineNumber == this.props.findLine} bookmarked={this.props.findBookmark(this.props.bookmarks, filteredLines[index].lineNumber) !== -1} wrap={this.props.wrap} line={filteredLines[index]} toggleBookmark={this.props.toggleBookmark} colorMap={this.props.colorMap} find={this.props.find} caseSensitive={this.props.caseSensitive}/>)}
            length={filteredLines.length}
            initialIndex={this.props.scrollLine}
            type={this.props.wrap ? 'variable' :'uniform'}
            useStaticSize={true}
          />
        );
        return list;
    }

    scrollToLine(lineNumber) {
        let scrollIndex = this.indexMap[lineNumber] - 20;
        if(scrollIndex < 0) {
            scrollIndex = 0;
        }
        this.refs.logList.scrollTo(scrollIndex);

        window.scrollBy(0, -45);
    }

    shouldComponentUpdate(nextProps, nextState){
        if (nextProps.scrollLine !== null && nextProps.scrollLine >= 0 && this.props.scrollLine !== nextProps.scrollLine) {
            this.scrollToLine(nextProps.scrollLine);
        }

        if(nextProps.lines !== this.props.lines) {
            return true;
        }
        if(nextProps.bookmarks !== this.props.bookmarks) {
            return true;
        }
        if(nextProps.filter !== this.props.filter) {
            return true;
        }
        if(nextProps.inverseFilter !== this.props.inverseFilter) {
            return true;
        }
        if(nextProps.find !== this.props.find) {
            return true;
        }
        if(nextProps.findLine !== this.props.findLine) {
            return true;
        }
        if(nextProps.wrap !== this.props.wrap) {
            return true;
        }
        if(nextProps.caseSensitive !== this.props.caseSensitive) {
            return true;
        }
        if(nextState.dummyCounter != this.state.dummyCounter){
            return true;
        }

        return false;
    }

    scrollFindIntoView() {
        if(this.props.findLine < 0) {
            return;
        }

        let findElements = document.getElementsByClassName("findResult" + this.props.findLine);
        if(findElements.length > 0) {
            let elem = findElements[0];
            let position = elem.getBoundingClientRect();
            let windowHeight = window.innerHeight;
            let windowWidth = window.innerWidth;

            let scrollX = window.scrollX;
            let scrollY = window.scrollY - 45; // Account for header

            if(position.right > windowWidth) {
                // Scroll so the leftmost part of the component is 2/3 of the way into the screen.
                scrollX = position.left - windowWidth/3; 
            }
            window.scrollTo(scrollX, scrollY);
        } else {
            // We probably just need to setState again.
            this.setState({dummyCounter: this.state.dummyCounter + 1})
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.scrollLine !== null && this.props.scrollLine >= 0 && this.props.scrollLine !== prevProps.scrollLine) {
            this.scrollToLine(this.props.scrollLine);
        }
        this.scrollFindIntoView();

    }

    render() {
        let self = this;
        let processed = [];
        let lines = self.props.lines;
        let j = 0;
        this.indexMap={};

        for (let i = 0;i < lines.length; i++) {
            let line = lines[i];
            if (!this.props.shouldPrintLine(this.props.bookmarks, line, this.props.filter, this.props.inverseFilter)) {
                continue;
            }
            this.indexMap[i] = j++;
            processed.push(line);
        }
        let output = self.genList(processed);
        if(output.length !== 0){
            return (<div>
                {output}
                </div>
            )
        }
        return (<div>Failed!</div>);
    }
}
export default LogView;
