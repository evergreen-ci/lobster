// @flow strict

import React from 'react';
import './style.css';
import { Button, ButtonToolbar, Form, FormControl, ControlLabel, FormGroup, Col } from 'react-bootstrap';
import CollapseMenu from './CollapseMenu';
import { connect } from 'react-redux';
import { search, toggleSettingsPanel, setSearch } from '../../actions/logviewer';
import type { Settings, LineData } from '../../models';
import type { Ref } from 'react';

type Props = {
  setFormRef: (?HTMLInputElement) => void,
  settings: Settings,
  searchTerm: string,
  addFilter: () => void,
  addHighlight: () => void,
  wipeCache: () => void,
  togglePanel: () => void,
  detailsOpen: boolean,
  handleSubmit: (SyntheticEvent<HTMLButtonElement>) => void,
  setURLRef: (?HTMLInputElement) => void,
  findIdx: number,
  changeFindIdx: (number) => void,
  nextFind: () => void,
  prevFind: () => void,
  setSearch: (value: string) => void,
  findResults: LineData
};

export class Toolbar extends React.PureComponent<Props> {
  findInput: Ref<*>

  constructor(props: Props) {
    super(props);
    this.findInput = React.createRef();
  }

  showFind = () => {
    if (this.props.searchTerm !== '') {
      if (this.props.findResults.findResults.length > 0) {
        return (
          <span><Col lg={1} componentClass={ControlLabel} className="next-prev" >{this.props.findIdx + 1}/{this.props.findResults.findResults.length}</Col>
            <Button onClick={this.props.nextFind}>Next</Button>
            <Button onClick={this.props.prevFind}>Prev</Button>
          </span>);
      }
      return <Col lg={1} componentClass={ControlLabel} className="not-found" >Not Found</Col>;
    }
  }

  handleChangeFindEvent = () => {
    if (this.findInput.current != null) {
      this.props.setSearch(this.findInput.current.value);
    }
  }

  submit = (event: Event) => {
    if (event.keyCode === 13) {
      event.preventDefault();
      if (event.shiftKey) {
        this.props.prevFind();
      } else {
        this.props.nextFind();
      }
    }
  }

  focusOnFind(event: KeyboardEvent) {
    event.preventDefault();
    if (this.findInput.current) {
      this.findInput.current.focus();
    }
  }

  handleKeyDown = (event: KeyboardEvent) => {
    switch (event.keyCode) {
      case 114: // F3
        this.focusOnFind(event);
        break;

      case 70: // F
        if (event.ctrlKey || event.metaKey) {
          this.focusOnFind(event);
        }
        break;
      // no default
    }
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown);
    if (this.findInput.current) {
      this.findInput.current.addEventListener('keydown', this.submit);
    }
  }
  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown);
    if (this.findInput.current) {
      this.findInput.current.removeEventListener('keydown', this.submit);
    }
  }

  render() {
    return (
      <Col lg={11} lgOffset={1}>
        <div className="find-box">
          <Form horizontal onSubmit={this.submit}>
            <FormGroup controlId="findInput" className="filter-header">
              <Col lg={6} >
                <FormControl
                  inputRef={this.findInput}
                  type="text"
                  placeholder="optional. regexp to search for"
                  onChange={this.handleChangeFindEvent}
                />
              </Col>
              <ButtonToolbar>
                <Button id="formSubmit" type="submit">Find</Button>
                {this.showFind()}
                <Button onClick={this.props.addFilter}>Add Filter</Button>
                <Button onClick={this.props.addHighlight}>Add Highlight</Button>
                <Button onClick={this.props.togglePanel}>{this.props.detailsOpen ? 'Hide Details \u25B4' : 'Show Details \u25BE'}</Button>
              </ButtonToolbar>
            </FormGroup>
          </Form>
          <CollapseMenu
            handleSubmit={this.props.handleSubmit}
            setURLRef={this.props.setURLRef}
          />
        </div>
      </Col>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    ...state,
    ...ownProps,
    settings: state.logviewer.settings,
    findIdx: state.logviewer.find.findIdx,
    searchTerm: state.logviewer.find.searchTerm,
    detailsOpen: state.logviewer.settingsPanel,
    lines: state.log.lines
  };
}

function mapDispatchToProps(dispatch: Dispatch<*>, ownProps) {
  return {
    ...ownProps,
    togglePanel: () => dispatch(toggleSettingsPanel()),
    nextFind: () => dispatch(search('next')),
    prevFind: () => dispatch(search('prev')),
    setSearch: (value: string) => dispatch(setSearch(value))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Toolbar);
