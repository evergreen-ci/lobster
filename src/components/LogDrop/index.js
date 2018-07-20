// @flow strict

import React from 'react';
import { connect } from 'react-redux';
import * as actions from '../../actions';
import { type LogType, logTypes } from '../../models';
import { Button } from 'react-bootstrap';
import type { ContextRouter } from 'react-router-dom';
import './style.css';

type Props = {|
  processLog: (data: string, type: LogType) => void,
|} & ContextRouter

type State = {|
  files: ?FileList,
  processing: boolean,
  error: ?string
|}

export class LogDrop extends React.PureComponent<Props, State> {
  dropArea: ?HTMLDivElement
  select: ?HTMLSelectElement
  button: ?Button

  constructor(props: Props) {
    super(props);
    this.state = {
      files: null,
      processing: false,
      error: null
    };
  }

  drop = (e: DragEvent) => {
    e.preventDefault();
    if (e.type === 'drop') {
      if (e.dataTransfer != null) {
        this.setState({ files: e.dataTransfer.files });
      }
    }
  }

  refCallback = (div: ?HTMLDivElement) => {
    this.dropArea = div;
    if (this.dropArea != null) {
      const da: HTMLDivElement = this.dropArea;
      da.addEventListener('dragover', (e: DragEvent) => e.preventDefault(), false);
      da.addEventListener('dragleave', (e: DragEvent) => e.preventDefault(), false);
      da.addEventListener('drop', this.drop, false);
    }
  }

  selectCallback = (select: ?HTMLSelectElement) => {this.select = select;}

  upload = () => {
    if (this.select == null || this.state.files == null || this.state.files.length !== 1) {
      return;
    }
    const self = this;
    const f = this.state.files[0];
    const type = this.select.value;
    const reader = new FileReader();
    reader.onloadend = function() {
      // Flow is wrong about this type
      // $FlowFixMe
      self.props.processLog(reader.result, type);
      self.props.history.push('/lobster/logdrop');
    };

    reader.onerror = function(err: Error) {
      self.setState({ error: String(err) });
    };
    reader.readAsText(f);
    this.setState({ processing: true });
  }

  render() {
    let child = null;
    if (this.state.error != null) {
      child = (
        <div ref={this.refCallback} className="logview-drop" onDrop={this.drop}>
          <p>An error occurred: {this.state.error}. Please try again.</p>
        </div>
      );
    } else if (this.state.processing) {
      child = (
        <div ref={this.refCallback} className="logview-drop">
          <p>Processing log file now, you&#39;ll automatically be redirected</p>
        </div>
      );
    } else if (this.state.files != null) {
      if (this.state.files.length !== 1) {
        child = (
          <div ref={this.refCallback} className="logview-drop" onDrop={this.drop}>
            <p>Expected to receive 1 file, but received {this.state.files.length} files.</p>
          </div>
        );
      } else {
        child = (
          <div ref={this.refCallback} className="logview-drop" onDrop={this.drop}>
            <p>
              Process {this.state.files[0].name} as
              <select ref={this.selectCallback}>
                {
                  logTypes().map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))
                }
              </select>
            </p>
            <p>
              <Button disabled={this.state.processing} onClick={this.upload}>Process Log</Button>
            </p>
          </div>
        );
      }
    } else if (window.File && window.FileList && window.FileReader) {
      child = (
        <div ref={this.refCallback} className="logview-drop" onDrop={this.drop}>
          <p>Drag and drop a log file here to view it in Lobster</p>
        </div>
      );
    } else {
      child = (
        <div className="logview-drop">
          <p>If you were using Chrome or Firefox, you could drag and drop a file here</p>
        </div>
      );
    }

    return (
      <div className="logview-parent">
        {child}
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    ...ownProps,
  };
}

function mapDispatchToProps(dispatch: Dispatch<*>) {
  return {
    processLog: (data, type) => dispatch(actions.processLocalData(data, type))
  };
}

export default connect(undefined, mapDispatchToProps)(LogDrop);
