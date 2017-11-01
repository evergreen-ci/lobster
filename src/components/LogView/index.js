import React from 'react';


import './style.css';
import {Element, scroller} from "react-scroll";


class LogLineText extends React.Component {
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
        let line = this.props.line;
        let style = {color: this.props.line.color};
        return <div style={style}>{line.line}</div>;
    }

}

class LineNumber extends React.Component {
    constructor(props){
        super(props);
        this.state = {
        };
    }

    handleDoubleClick() {
        this.props.toggleBookmark();
    }

    render() {
         return <Element name={this.props.lineNumber}><div className="padded-text no-select" onDoubleClick={this.handleDoubleClick.bind(this)}>{this.props.lineNumber}</div></Element>;
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
        if(this.props.line.gitRef) {
            return<span className="no-select" onClick={this.handleClick.bind(this, this.props.line.gitRef)}>&nbsp;&#128279;&nbsp;</span>;
        }
        return <div></div>;
    }

}

class LogLine extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            bookmarked: false,
        };
    }
    
    toggleBookmark() {
        this.setState({bookmarked: !this.state.bookmarked});
    }

    render() {
        let className = 'monospace';
        if (this.props.line.lineNumber === this.props.scrollLine || this.state.bookmarked) {
            className += ' bookmark-line';
        }
        if (!this.props.wrap) {
           className += ' no-wrap'; 
        }

         return <tr className={className}><td><LineNumber lineNumber={this.props.line.lineNumber} toggleBookmark={this.toggleBookmark.bind(this)}/></td><td><LogOptions gitVersion={this.props.gitVersion} line={this.props.line}/></td><td><LogLineText line={this.props.line}/></td></tr>;
    }

}

class LogView extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            processed: '',
            scrollLine: this.props.scrollLine,
        };
    }

    genHtml(jsonInput) {
        const objects = [];
        for ( let i in jsonInput)   {
            objects.push(<LogLine gitVersion={this.props.gitVersion} line={jsonInput[i]} wrap={this.props.wrap} scrollLine={this.state.scrollLine}/>);
        }
        return (
            <div><table>{objects}</table></div>
        );
    }

    shouldComponentUpdate(nextProps, nextState){
        if(nextProps.lines !== this.props.lines || nextProps.filter !== this.props.filter){
            return true;
        }
        if(this.state.scrollLine !== nextProps.scrollLine){
            scroller.scrollTo(nextProps.scrollLine, {});
        }

        if(this.props.wrap !== nextState.wrap){
            return true;
        }
        return false;
    }

    componentWillReceiveProps(nextProps){
        this.setState({scrollLine: nextProps.scrollLine});
    }

    componentDidMount(){
        if(this.state.scrollLine){
            scroller.scrollTo(this.state.scrollLine, {});
        }
    }

    componentDidUpdate(){
        if(this.state.scrollLine) {
            scroller.scrollTo(this.state.scrollLine, {});
        }
    }

    render() {
        let self = this;
        let processed = [];
        let lines = self.props.lines;

        for (let i in lines) {
            let line = lines[i];
            if (self.props.filter && !line.line.match(self.props.filter)) {
                continue;
            }
            processed.push(line);
        }
        let output = self.genHtml(processed);
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
