// @flow

import React from 'react';
import { Button, Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import * as actions from '../../actions';

type Props = {
  show: boolean,
  save: (value: number) => void,
  never: () => void,
  later: () => void
}

type State = {
  value: number
}

export class CacheModal extends React.PureComponent<Props, State> {
  inputRef: ?HTMLInputElement

  constructor(props: Props) {
    super(props);
    this.state = {
      value: 2048
    };
  }

  bindRef = (ref: ?HTMLInputElement) => {
    this.inputRef = ref;
  }

  onChange = () => {
    if (this.inputRef) {
      this.setState({value: parseInt(this.inputRef.value, 10)});
    }
  }

  save = () => {
    this.props.save(this.state.value);
  }

  render() {
    if (!this.props.show) {
      return null;
    }
    return (
      <div className="static-modal">
        <Modal.Dialog>
          <Modal.Header>
            <Modal.Title>Lobster Local Cache</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <p>Lobster can now locally cache logs as you view them!</p>
            <p>
              If you would like to enable this feature, use the slider to
              select the size of your cache, and click Yes. Otherwise, select
              No to be asked the next time you load a lobster page, or Never
              to not be asked again.
            </p>
            <p>
              <input type="range" ref={this.bindRef} min="128" max="10240" value={this.state.value} onChange={this.onChange} />
              <label htmlFor={this.inputRef}>{this.state.value} MiB</label>
            </p>
          </Modal.Body>

          <Modal.Footer>
            <Button bsStyle="danger" onClick={this.props.never}>Never</Button>
            <Button onClick={this.props.later}>Not Now</Button>
            <Button bsStyle="primary" onClick={this.save}>Yes</Button>
          </Modal.Footer>
        </Modal.Dialog>
      </div>
    );
  }
}

function mapStateToProps(state, _ownProps) {
  return {show: state.cache.status === null};
}

function mapDispatchToProps(dispatch: Dispatch<*>) {
  return {
    save: (value: number) => dispatch(actions.setupCache('ok', value)),
    never: () => dispatch(actions.setupCache('never', 0)),
    later: () => dispatch(actions.setupCache('later', 0))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CacheModal);
