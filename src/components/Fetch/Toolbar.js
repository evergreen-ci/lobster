// @flow strict

import React from 'react';
import './style.css';
import { Button, ButtonToolbar, Form, FormControl, ControlLabel, FormGroup, Col } from 'react-bootstrap';
import CollapseMenu from './CollapseMenu';
import { connect } from 'react-redux';
import { search, toggleSettingsPanel, setSearch } from '../../actions/logviewer';
import lines from '../../selectors/lines';
import type { Settings, Line } from '../../models';
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
  findResults: Object,
  changeFindIdx: (number) => void,
  nextFind: () => void,
  prevFind: () => void,
  setSearch: (value: string) => void

};

export class Toolbar extends React.PureComponent<Props> {
  findInput: Ref<HTMLInputElement>
  constructor(props: Props) {
    super(props);
    this.findInput = React.createRef();
  }

  showFind = () => {

    if (this.props.searchTerm != null) {
      if (this.props.findResults.findResults.length > 0 && this.props.lines.length !== this.props.findResults.findResults.length) {
        return (
          <span><Col lg={1} componentClass={ControlLabel} className="next-prev" >{this.props.findIdx + 1}/{this.props.findResults.findResults.length}</Col>
            <Button onClick={this.props.nextFind}>Next</Button>
            <Button onClick={this.props.prevFind}>Prev</Button>
          </span>);
      }
      return <Col lg={1} componentClass={ControlLabel} className="not-found" >Not Found</Col>;
    }
  }

  handleChangeFindEvent = (event: Event) => {
    if (this.findInput.current) {
      this.props.setSearch(this.findInput.current.value);
    }
  }

  submit = (event: Event) => {
    event.preventDefault();
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
                <Button id="formSubmit" type="submit" onClick={this.props.nextFind}>Find</Button>
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
            detailsOpen={this.props.detailsOpen}
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
    lines: state.log.lines,
    findResults: lines(state)
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
