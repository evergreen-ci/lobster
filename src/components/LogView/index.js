import React from 'react';


import './style.css';
import ReactList from 'react-list';


class LogLineText extends React.Component {
    constructor(props){
        super(props);
        this.state = {
        };
    }

    render() {
        let style = {color: this.props.colorMap[this.props.port]};
        return <span style={style}>{this.props.text}</span>;
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
        let className = 'monospace';
        if (this.props.bookmarked) {
            className += ' bookmark-line';
        }
        if (!this.props.wrap) {
            className += ' no-wrap';
        } else {
            className += ' wrap';
        }

        return (<div key={this.props.key} className={className}><LineNumber lineNumber={this.props.line.lineNumber} toggleBookmark={this.props.toggleBookmark} /> <LogOptions gitRef={this.props.line.gitRef} /> <LogLineText text={this.props.line.text} port={this.props.line.port} colorMap={this.props.colorMap} /></div>);
    }

}

class LogView extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            processed: '',
        };
        this.indexMap= {};
    }

    genList(filteredLines) {
        let list =  (
          <ReactList
            ref="logList"
            itemRenderer={(index, key) => (<FullLogLine key={key} bookmarked={this.props.findBookmark(this.props.bookmarks, filteredLines[index].lineNumber) !== -1} wrap={this.props.wrap} line={filteredLines[index]} toggleBookmark={this.props.toggleBookmark} colorMap={this.props.colorMap} />)}
            length={filteredLines.length}
            type={this.props.wrap ? 'variable' :'uniform'}
            useStaticSize={true}
          />
        );
        return list;
    }

    shouldComponentUpdate(nextProps, nextState){
        if(nextProps.lines !== this.props.lines || nextProps.filter !== this.props.filter) {
            return true;
        }

        if (this.props.scrollLine !== nextProps.scrollLine) {
            this.refs.logList.scrollTo(this.indexMap[nextProps.scrollLine]);
            return false;
        }

        if(this.props.wrap !== nextState.wrap){
            return true;
        }
        return false;
    }

    componentWillReceiveProps(nextProps){
        this.setState({scrollLine: nextProps.scrollLine});
    }

    render() {
        let self = this;
        let processed = [];
        let lines = self.props.lines;
        let j = 0;
        this.indexMap={};

        for (let i = 0;i < lines.length; i++) {
            let line = lines[i];
            if ((this.props.findBookmark(this.props.bookmarks, i) === -1) && self.props.filter && !line.text.match(self.props.filter)) {
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
