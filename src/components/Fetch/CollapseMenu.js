// @flow strict

import React from 'react';
import type { Node as ReactNode } from 'react';
import './style.css';
import { Button, Form, FormControl, FormGroup, Col, ControlLabel, Collapse, ToggleButtonGroup, ToggleButton } from 'react-bootstrap';
import { Filters } from './Filters';
import { Highlights } from './Highlights';
import type { Settings } from '../../models';
import * as api from '../../api';
import * as actions from '../../actions/logviewer';
import { wipeCache } from '../../actions';
import { connect } from 'react-redux';
import jira from '../../selectors/jira';
import type { LogIdentity, Highlight, Filter } from '../../models';

type Props = {
  settings: Settings,
  toggleSettings: {
    toggleWrap: () => void,
    toggleCaseSensitive: () => void,
    toggleFilterIntersection: () => void
  },
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
  wipeCache: () => void,
  filterList: Filter[],
  highlightList: Highlight[],
  detailsOpen: boolean,
  handleSubmit: (SyntheticEvent<HTMLButtonElement>) => void,
  setURLRef: (?HTMLInputElement) => void,
  valueJIRA: string,
  logIdentity: ?LogIdentity,
}

function showLogBox(id: ?LogIdentity, setURLRef: (?HTMLInputElement) => void): ?ReactNode {
  if (id && id.type === 'lobster') {
    return (
      <FormGroup controlId="urlInput">
        <Col componentClass={ControlLabel} lg={1}>Log</Col>
        <Col lg={6}>
          <FormControl
            type="text"
            defaultValue={id.file}
            placeholder="optional. custom file location iff used with local server"
            inputRef={setURLRef}
          />
        </Col>
        <Col lg={1}> <Button type="submit"> Apply </Button> </Col>
      </FormGroup>
    );
  }
}

function showDetailButtons(id: ?LogIdentity, clearCache: ?() => void): ?ReactNode {
  if (!id) {
    return null;
  }
  const buttons = [];
  if (id.type === 'logkeeper') {
    if (id.test == null) {
      const { build } = id;
      buttons.push(...[
        <Col key={0} lg={1}><Button href={`/build/${build}`}>Job Logs</Button></Col>,
        <Col key={1} lg={1}><Button href={`/build/${build}/all?raw=1`}>Raw</Button></Col>,
        <Col key={2} lg={1}><Button href={`/build/${build}/all?html=1`}>HTML</Button></Col>
      ]);
    } else {
      const { build, test } = id;
      buttons.push(...[
        <Col key={0} lg={1}><Button href={`/build/${build}`}>Job Logs</Button></Col>,
        <Col key={1} lg={1}><Button href={`/build/${build}/test/${test}?raw=1`}>Raw</Button></Col>,
        <Col key={2} lg={1}><Button href={`/build/${build}/test/${test}?html=1`}>HTML</Button></Col>
      ]);
    }
  } else if (id.type === 'evergreen-task') {
    buttons.push(...[
      <Col key={0} lg={1}><Button href={api.taskURL(id.id, id.execution)}>Task</Button></Col>,
      <Col key={1} lg={1}><Button href={api.taskLogRawURL(id.id, id.execution, id.log)}>Raw</Button></Col>,
      <Col key={2} lg={1}><Button href={api.taskLogURL(id.id, id.execution, id.log)}>HTML</Button></Col>
    ]);
  } else if (id.type === 'evergreen-test') {
    buttons.push(...[
      <Col key={1} lg={1}><Button href={api.testLogRawURL(id.id)}>Raw</Button></Col>,
      <Col key={2} lg={1}><Button href={api.testLogURL(id.id)}>HTML</Button></Col>
    ]);
  }
  if (clearCache != null) {
    buttons.push(<Col key={3} lg={1}><Button bsStyle="danger" onClick={clearCache}>Clear Cache</Button></Col>);
  }
  return (<span>{buttons}</span>);
}

export class CollapseMenu extends React.PureComponent<Props> {
  render() {
    return (
      <Collapse className="collapse-menu" in={this.props.detailsOpen}>
        <div>
          <Form horizontal onSubmit={this.props.handleSubmit}>
            {showLogBox(this.props.logIdentity, this.props.setURLRef)}
            <FormGroup controlId="collapseButtons">
              <Col lg={5}>
                <span className="far-left-label">Wrap</span>
                <ToggleButtonGroup
                  className="toggle-buttons"
                  type="radio"
                  name="wrap-on-off"
                  value={this.props.settings.wrap}
                  onChange={this.props.toggleSettings.toggleWrap}
                >
                  <ToggleButton value={true} bsSize="small" bsStyle="primary">on</ToggleButton>
                  <ToggleButton value={false} bsSize="small" bsStyle="primary">off</ToggleButton>
                </ToggleButtonGroup>
                <span className="toggle-label">Case Sensitive</span>
                <ToggleButtonGroup
                  className="toggle-buttons"
                  type="radio"
                  name="case-sensitive-on-off"
                  value={this.props.settings.caseSensitive}
                  onChange={this.props.toggleSettings.toggleCaseSensitive}
                >
                  <ToggleButton value={true} bsSize="small" bsStyle="primary">on</ToggleButton>
                  <ToggleButton value={false} bsSize="small" bsStyle="primary">off</ToggleButton>
                </ToggleButtonGroup>
                <span className="toggle-label">Filter Logic</span>
                <ToggleButtonGroup
                  className="toggle-buttons"
                  type="radio"
                  name="filter-intersection-and-or"
                  value={this.props.settings.filterIntersection}
                  onChange={this.props.toggleSettings.toggleFilterIntersection}
                >
                  <ToggleButton value={true} bsSize="small" bsStyle="primary">and</ToggleButton>
                  <ToggleButton value={false} bsSize="small" bsStyle="primary">or</ToggleButton>
                </ToggleButtonGroup>
              </Col>
              <Col componentClass={ControlLabel} lg={1}>JIRA</Col>
              <Col lg={1}><textarea readOnly className="unmoving" value={this.props.valueJIRA}></textarea></Col>
              {showDetailButtons(this.props.logIdentity, this.props.wipeCache)}
            </FormGroup>
          </Form>
          <Filters
            filters={this.props.filterList}
            removeFilter={this.props.filterActions.removeFilter}
            toggleFilter={this.props.filterActions.toggleFilter}
            toggleFilterInverse={this.props.filterActions.toggleFilterInverse}
          />
          <Highlights
            highlights={this.props.highlightList}
            removeHighlight={this.props.highlightActions.removeHighlight}
            toggleHighlight={this.props.highlightActions.toggleHighlight}
            toggleHighlightLine={this.props.highlightActions.toggleHighlightLine}
          />
        </div>
      </Collapse>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    ...state, ...ownProps,
    settings: state.logviewer.settings,
    filterList: state.logviewer.filters,
    highlightList: state.logviewer.highlights,
    findIdx: state.logviewer.find.findIdx,
    searchRegex: state.logviewer.find.searchRegex,
    logIdentity: state.log.identity,
    valueJIRA: jira(state, ownProps)
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
    ...ownProps,
    toggleSettings: toggleSettings,
    filterActions, highlightActions,
    changeFindIdx: (index) => dispatch(actions.changeFindIdx(index)),
    wipeCache: () => dispatch(wipeCache())
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CollapseMenu);
