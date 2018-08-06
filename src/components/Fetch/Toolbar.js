// @flow strict

import React from 'react';
import './style.css';
import { Button, ButtonToolbar, Form, FormControl, ControlLabel, FormGroup, Col } from 'react-bootstrap';
import CollapseMenu from './CollapseMenu';
import { connect } from 'react-redux';
import { toggleSettingsPanel } from '../../actions/logviewer';
import type { Settings } from '../../models';

type Props = {
  setFormRef: (?HTMLInputElement) => void,
  settings: Settings,
  handleChangeFindEvent: () => void,
  searchRegex: string,
  find: (SyntheticEvent<HTMLButtonElement>) => void,
  addFilter: () => void,
  addHighlight: () => void,
  wipeCache: () => void,
  togglePanel: () => void,
  detailsOpen: boolean,
  handleSubmit: (SyntheticEvent<HTMLButtonElement>) => void,
  setURLRef: (?HTMLInputElement) => void,
  findIdx: number,
  findResults: number[],
  changeFindIdx: (number) => void,
  nextFind: () => void,
  prevFind: () => void
};

export class Toolbar extends React.PureComponent<Props> {
  showFind = () => {
    if (this.props.searchRegex !== '') {
      if (this.props.findResults.length > 0) {
        return (
          <span><Col lg={1} componentClass={ControlLabel} className="next-prev" >{this.props.findIdx + 1}/{this.props.findResults.length}</Col>
            <Button onClick={this.props.nextFind}>Next</Button>
            <Button onClick={this.props.prevFind}>Prev</Button>
          </span>);
      }
      return <Col lg={1} componentClass={ControlLabel} className="not-found" >Not Found</Col>;
    }
  }

  render() {
    return (
      <Col lg={11} lgOffset={1}>
        <div className="find-box">
          <Form horizontal>
            <FormGroup controlId="findInput" className="filter-header">
              <Col lg={6} >
                <FormControl
                  type="text"
                  placeholder="optional. regexp to search for"
                  inputRef={this.props.setFormRef}
                  onChange={this.props.handleChangeFindEvent}
                />
              </Col>
              <ButtonToolbar>
                <Button id="formSubmit" type="submit" onClick={this.props.find}>Find</Button>
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
    searchRegex: state.logviewer.find.searchRegex,
    detailsOpen: state.logviewer.settingsPanel
  };
}

function mapDispatchToProps(dispatch: Dispatch<*>, ownProps) {
  return {
    ...ownProps,
    togglePanel: () => dispatch(toggleSettingsPanel())
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Toolbar);
