import React from 'react';


import './style.css';
import {Element, scroller} from "react-scroll";


class LogView extends React.Component {

    handleClick(gitRef) {
        window.open(gitRef);
    }

    constructor(props){
        super(props);
        this.state = {
            /**
             *  Backend dummy server that returns the logs by fetching from the provided url.
             */
            processed: '',
            scrollLine: this.props.scrollLine,
            gitPage: "https://github.com/mongodb/mongo",
        };
    }

    genHtml(jsonInput) {
        const objects = [];
        for ( let i in jsonInput)   {
            let line = i + '. ' + jsonInput[i].line;
            if ( i === this.state.scrollLine) {
                if (jsonInput[i].gitRef) {
                    objects.push(
                        <Element name={i}> <div className="goto-line" key={i} onClick={this.handleClick.bind(this, jsonInput[i].gitRef)}>{line}</div> </Element>
                    )
                }
                else {
                    objects.push(
                       <Element name={i}> <div className="goto-line" key={i}>{line}</div> </Element>
                    )
                }
            }
            else if (jsonInput[i].gitRef) {
                objects.push(
                   <Element name={i}> <div className="gitref-link" key={i} onClick={this.handleClick.bind(this, jsonInput[i].gitRef)}>{line}</div> </Element>
                );
            }
            else {
                objects.push(
                    <Element name={i}><div className="nogitref-link" key={i}>{line}</div></Element>
                );
            }
        }
        return (
            <div>{objects}</div>
        );
    }

    getGitVersion(line){
        const gitVersionStr = "git version: ";
        let gitVersionPos = line.indexOf(gitVersionStr);
        if (gitVersionPos !== -1) {
            return line.substr(gitVersionPos + gitVersionStr.length);
        }
        return false;
    }

    shouldComponentUpdate(nextProps, nextState){
        if(nextProps.lines !== this.props.lines || nextProps.filter !== this.props.filter){
            return true;
        }
        if(this.state.scrollLine !== nextProps.scrollLine){
            scroller.scrollTo(nextProps.scrollLine, {});
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
        let gitVersion = "master";
        let isGitVersionSet = false;
        const gitPrefix = "https://github.com/mongodb/mongo/blob/";
        const prefix = "{githash:";
        const prefixLen = prefix.length + 2;
        let lines = self.props.lines;

        for (let i in lines) {
            let line = lines[i];
            if (self.props.filter && !line.match(self.props.filter)) {
                continue;
            }
            if (!isGitVersionSet) {
                let gitVersionStr = this.getGitVersion(line);
                if(gitVersionStr){
                    gitVersion = gitVersionStr;
                }
            }
            const startIdx = line.indexOf(prefix);
            if (startIdx !== -1) {
                const stopIdx = line.indexOf("}", startIdx);
                if (stopIdx > startIdx + prefixLen) {
                    const fileLine = line.substr(startIdx+prefixLen, stopIdx-(startIdx+prefixLen)-1);
                    const textLine = line.substr(0, startIdx-1) + line.substr(stopIdx+1);
                    processed.push({gitRef:gitPrefix + gitVersion + "/" + fileLine, line:textLine});
                }
            }
            else {
                processed.push({line:lines[i]});
            }
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
