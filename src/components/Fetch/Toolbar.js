// @flow strict

import React from 'react';
import './style.css';
import { Button, ButtonToolbar, Form, FormControl, ControlLabel, FormGroup, Col } from 'react-bootstrap';
import CollapseMenu from './CollapseMenu';
import { connect } from 'react-redux';
import { wipeCache } from '../../actions';
import * as actions from '../../actions/logviewer';
import type { Highlight, Filter } from '../../actions/logviewer';

type Props = {
  setFormRef: (?HTMLInputElement) => void,
  settings: {
    wrap: boolean,
    caseSensitive: boolean,
    filterIntersection: boolean
  },
  toggleSettings: {
    toggleWrap: () => void,
    toggleCaseSensitive: () => void,
    toggleFilterIntersection: () => void
  },
  handleChangeFindEvent: () => void,
  searchRegex: string,
  find: (SyntheticEvent<HTMLButtonElement>) => void,
  addFilter: () => void,
  addHighlight: () => void,
  filterActions: {
    removeFilter: (string) => void,
    toggleFilter: (string) => void,
    toggleFilterInverse: (string) => void
  },
  highlightActions: {
    removeHighlight: (string) => void,
    toggleHighlight: (string) => void,
    toggleHighlightLine: (string) => void
  },
  filterList: Filter[],
  highlightList: Highlight[],
  togglePanel: () => void,
  detailsOpen: boolean,
  handleSubmit: (SyntheticEvent<HTMLButtonElement>) => void,
  server?: string,
  url?: string,
  build: string,
  setURLRef: (?HTMLInputElement) => void,
  valueJIRA: string,
  findIdx: number,
  findResults: number[],
  changeFindIdx: (number) => void,
  changeSearch: (string) => void,
  nextFind: () => void,
  prevFind: () => void
};

export class Toolbar extends React.Component<Props> {
  shouldComponentUpdate(nextProps: Props, _nextState: void) {
    if (nextProps.detailsOpen !== this.props.detailsOpen) {
      return true;
    }
    if (nextProps.findIdx !== this.props.findIdx) {
      return true;
    }
    if (nextProps.findResults !== this.props.findResults) {
      return true;
    }
    if (nextProps.settings !== this.props.settings) {
      return true;
    }
    if (nextProps.toggleSettings !== this.props.toggleSettings) {
      return true;
    }
    if (nextProps.filterList !== this.props.filterList || nextProps.highlightList !== this.props.highlightList) {
      return true;
    }
    return false;
  }

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
            detailsOpen={this.props.detailsOpen}
            handleSubmit={this.props.handleSubmit}
            settings={this.props.settings}
            server={this.props.server}
            url={this.props.url}
            toggleSettings={this.props.toggleSettings}
            build={this.props.build}
            setURLRef={this.props.setURLRef}
            valueJIRA={this.props.valueJIRA}
            filterActions={this.props.filterActions}
            highlightActions={this.props.highlightActions}
            highlightList={this.props.highlightList}
            filterList={this.props.filterList}
            wipeCache={this.props.wipeCache}
          />
        </div>
      </Col>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    ...state, ...ownProps,
    settings: state.settings,
    filterList: state.filters,
    highlightList: state.highlights,
    findIdx: state.find.findIdx,
    searchRegex: state.find.searchRegex
  };
}

function mapDispatchToProps(dispatch: Dispatch<*>, ownProps) {
  const filterActions = {
    toggleFilter: (text) => dispatch(actions.toggleFilter(text)),
    toggleFilterInverse: (text) => dispatch(actions.toggleFilterInverse(text)),
    removeFilter: (text) => dispatch(actions.removeFilter(text))
  };
  const highlightActions = {
    toggleHighlight: (text) => dispatch(actions.toggleHighlight(text)),
    toggleHighlightLine: (text) => dispatch(actions.toggleHighlightLine(text)),
    removeHighlight: (text) => dispatch(actions.removeHighlight(text))
  };
  const toggleSettings = {
    toggleWrap: () => dispatch(actions.toggleLineWrap()),
    toggleCaseSensitive: () => dispatch(actions.toggleCaseSensitivity()),
    toggleFilterIntersection: () => dispatch(actions.toggleFilterIntersection())
  };

  return {
    ...ownProps, toggleSettings: toggleSettings, filterActions, highlightActions,
    changeFindIdx: (index) => dispatch(actions.changeFindIdx(index)),
    changeSearch: (text) => dispatch(actions.changeSearch(text)),
    wipeCache: () => dispatch(wipeCache())
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Toolbar);
