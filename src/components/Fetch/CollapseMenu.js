// @flow strict

import * as React from 'react';
import './style.css';
import ToggleButton from 'react-toggle-button';
import { Button, Form, FormControl, FormGroup, Col, ControlLabel, Collapse } from 'react-bootstrap';
import { Filters } from './Filters';
import { Highlights } from './Highlights';
import type { Highlight, Filter } from '../../actions/logviewer';

type Props = {
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
  detailsOpen: boolean,
  handleSubmit: (SyntheticEvent<HTMLButtonElement>) => void,
  server?: string,
  url?: string,
  build: string,
  setURLRef: (?HTMLInputElement) => void,
  valueJIRA: string
}

function showLogBox(server: ?string, url: ?string, setURLRef: (?HTMLInputElement) => void): ?React.Node {
  if (server) {
    return (
      <FormGroup controlId="urlInput">
        <Col componentClass={ControlLabel} lg={1}>Log</Col>
        <Col lg={6}>
          <FormControl
            type="text"
            defaultValue={url}
            placeholder="optional. custom file location iff used with local server"
            inputRef={setURLRef}
          />
        </Col>
        <Col lg={1}> <Button type="submit"> Apply </Button> </Col>
      </FormGroup>
    );
  }
}

function showDetailButtons(server: ?string, build: string): ?React.Node {
  if (!server) {
    return (
      <span>
        <Col lg={1}><Button href={'/build/' + build}>Job Logs</Button></Col>
        <Col lg={1}><Button href={'/build/' + build + '/all?raw=1'}>Raw</Button></Col>
        <Col lg={1}><Button href={'/build/' + build + '/all?html=1'}>HTML</Button></Col>
      </span>
    );
  }
}

export class CollapseMenu extends React.PureComponent<Props> {
  render() {
    return (
      <Collapse className="collapse-menu" in={this.props.detailsOpen}>
        <div>
          <Form horizontal onSubmit={this.props.handleSubmit}>
            {showLogBox(this.props.server, this.props.url, this.props.setURLRef)}
            <FormGroup controlId="collapseButtons">
              <Col componentClass={ControlLabel} lg={1}>Wrap</Col>
              <Col lg={1}><ToggleButton value={this.props.settings.wrap} onToggle={this.props.toggleSettings.toggleWrap} /></Col>
              <Col componentClass={ControlLabel} lg={1}>Case Sensitive</Col>
              <Col lg={1}><ToggleButton value={this.props.settings.caseSensitive} onToggle={this.props.toggleSettings.toggleCaseSensitive} /></Col>
              <Col componentClass={ControlLabel} lg={1}>Filter Logic</Col>
              <Col lg={1}><ToggleButton inactiveLabel={'OR'} activeLabel={'AND'} value={this.props.settings.filterIntersection} onToggle={this.props.toggleSettings.toggleFilterIntersection} /></Col>
              <Col componentClass={ControlLabel} lg={1}>JIRA</Col>
              <Col lg={1}><textarea readOnly className="unmoving" value={this.props.valueJIRA}></textarea></Col>
              {showDetailButtons(this.props.server, this.props.build)}
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

export default CollapseMenu;
