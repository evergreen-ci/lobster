// @flow strict

import React from 'react';
import type { Node as ReactNode } from 'react';
import './style.css';
import {
  Button, Form, FormControl, FormGroup, Col, ControlLabel, Collapse,
  ToggleButtonGroup, ToggleButton } from 'react-bootstrap';
import { Filters } from './Filters';
import { Highlights } from './Highlights';
import type { Settings } from 'src/models';
import * as api from '../../api';
import * as actions from '../../actions';
import { connect } from 'react-redux';
import * as selectors from '../../selectors';
import type { ReduxState, LogIdentity, Highlight, Filter, Bookmark } from '../../models';

type Props = {
  settings: Settings,
  toggleSettings: {
    toggleWrap: () => void,
    toggleCaseSensitive: () => void,
    toggleFilterIntersection: () => void,
    toggleExpandableRows: () => void,
  },
  filterActions: {
    removeFilter: (string) => void,
    toggleFilter: (string) => void,
    toggleCaseSensitive: (string) => void,
    toggleFilterInverse: (string) => void
  },
  highlightActions: {
    removeHighlight: (string) => void,
    toggleHighlight: (string) => void,
    toggleCaseSensitive: (string) => void,
    toggleHighlightLine: (string) => void
  },
  loadLogByIdentity: (LogIdentity) => void,
  loadBookmarks: (Bookmark[]) => void,
  changeFindIdx: (number) => void,
  wipeCache: () => void,
  filterList: Filter[],
  highlightList: Highlight[],
  detailsOpen: boolean,
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
            defaultValue={id.url}
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
  } else if (id.type === 'evergreen-test-by-name') {
    buttons.push(...[
      <Col key={0} lg={1}><Button href={api.taskURL(id.task, id.execution)}>Task</Button></Col>,
      <Col key={1} lg={1}><Button href={api.testLogByNameRawURL(id.task, id.execution, id.test)}>Raw</Button></Col>,
      <Col key={2} lg={1}><Button href={api.testLogByNameURL(id.task, id.execution, id.test)}>HTML</Button></Col>
    ]);
  }
  if (clearCache != null) {
    buttons.push(<Col key={3} lg={1}><Button bsStyle="danger" onClick={clearCache}>Clear Cache</Button></Col>);
  }
  return (<span>{buttons}</span>);
}

export class CollapseMenu extends React.PureComponent<Props> {
  urlInput: ?HTMLInputElement;

  setURLRef = (ref: ?HTMLInputElement) => {
    this.urlInput = ref;
  }

  handleSubmit = (event: SyntheticEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (!this.urlInput || this.props.logIdentity == null ||
      this.props.logIdentity.type !== 'lobster') {
      return;
    }
    const { url, server } = this.props.logIdentity;
    const { value } = this.urlInput;
    if (url !== value) {
      this.props.changeFindIdx(-1);
      this.props.loadBookmarks([]);
      this.props.loadLogByIdentity({
        type: 'lobster',
        server: server,
        url: value
      });
    }
  }

  render() {
    return (
      <Collapse className="collapse-menu" in={this.props.detailsOpen}>
        <div>
          <Form horizontal onSubmit={this.handleSubmit}>
            {showLogBox(this.props.logIdentity, this.setURLRef)}
            <Col lg={3}>
              <FormGroup>
                <label className="control-label col-sm-8">Wrap</label>
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
              </FormGroup>

              <FormGroup>
                <label className="control-label col-sm-8">Case Sensitive</label>
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
              </FormGroup>
            </Col>

            <Col lg={3}>
              <FormGroup>
                <label className="control-label col-sm-8">Filter Logic</label>
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
              </FormGroup>

              <FormGroup>
                <label className="control-label col-sm-8">Expandable Rows</label>
                <ToggleButtonGroup
                  className="toggle-buttons"
                  type="radio"
                  name="expandable-rows-on-off"
                  value={this.props.settings.expandableRows}
                  onChange={this.props.toggleSettings.toggleExpandableRows}
                >
                  <ToggleButton value={true} bsSize="small" bsStyle="primary">on</ToggleButton>
                  <ToggleButton value={false} bsSize="small" bsStyle="primary">off</ToggleButton>
                </ToggleButtonGroup>
              </FormGroup>
            </Col>

            <FormGroup>
              <Col componentClass={ControlLabel} lg={1}>JIRA</Col>
              <Col lg={1}><textarea readOnly className="unmoving" value={this.props.valueJIRA}></textarea></Col>
              {showDetailButtons(this.props.logIdentity, this.props.wipeCache)}
            </FormGroup>
          </Form>
          <Filters
            filters={this.props.filterList}
            removeFilter={this.props.filterActions.removeFilter}
            toggleFilter={this.props.filterActions.toggleFilter}
            toggleCaseSensitive={this.props.filterActions.toggleCaseSensitive}
            toggleFilterInverse={this.props.filterActions.toggleFilterInverse}
          />
          <Highlights
            highlights={this.props.highlightList}
            removeHighlight={this.props.highlightActions.removeHighlight}
            toggleHighlight={this.props.highlightActions.toggleHighlight}
            toggleCaseSensitive={this.props.highlightActions.toggleCaseSensitive}
            toggleHighlightLine={this.props.highlightActions.toggleHighlightLine}
          />
        </div>
      </Collapse>
    );
  }
}

function mapStateToProps(state: ReduxState, ownProps) {
  return {
    ...ownProps,
    settings: selectors.getLogViewerSettings(state),
    filterList: selectors.getLogViewerFilters(state),
    highlightList: selectors.getLogViewerHighlights(state),
    findIdx: selectors.getLogViewerFindIdx(state),
    logIdentity: selectors.getLogIdentity(state),
    valueJIRA: selectors.getJiraTemplate(state),
    detailsOpen: selectors.getIsLogViewerSettingsPanel(state)
  };
}

function mapDispatchToProps(dispatch: Dispatch<*>, ownProps) {
  const filterActions = {
    toggleFilter: (text) => dispatch(actions.toggleFilter(text)),
    toggleFilterInverse: (text) => dispatch(actions.toggleFilterInverse(text)),
    toggleCaseSensitive: (text) => dispatch(actions.toggleFilterCaseSensitive(text)),
    removeFilter: (text) => dispatch(actions.removeFilter(text))
  };
  const highlightActions = {
    toggleHighlight: (text) => dispatch(actions.toggleHighlight(text)),
    toggleHighlightLine: (text) => dispatch(actions.toggleHighlightLine(text)),
    toggleCaseSensitive: (text) => dispatch(actions.toggleHighlightCaseSensitive(text)),
    removeHighlight: (text) => dispatch(actions.removeHighlight(text))
  };
  const toggleSettings = {
    toggleWrap: () => dispatch(actions.toggleLineWrap()),
    toggleCaseSensitive: () => dispatch(actions.toggleCaseSensitivity()),
    toggleFilterIntersection: () => dispatch(actions.toggleFilterIntersection()),
    toggleExpandableRows: () => dispatch(actions.toggleExpandableRows()),
  };

  return {
    ...ownProps,
    toggleSettings: toggleSettings,
    filterActions, highlightActions,
    changeFindIdx: (index) => dispatch(actions.changeFindIdx(index)),
    wipeCache: () => dispatch(actions.wipeCache()),
    loadLogByIdentity: (identity: LogIdentity) => dispatch(actions.loadLog(identity)),
    loadBookmarks: (bookmarksArr) => dispatch(actions.loadBookmarks(bookmarksArr))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CollapseMenu);
