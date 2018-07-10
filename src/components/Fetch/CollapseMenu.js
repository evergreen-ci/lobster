// @flow strict

import React from 'react';
import './style.css';
import ToggleButton from 'react-toggle-button';
import { Button, Form, FormControl, FormGroup, Col, ControlLabel, Collapse } from 'react-bootstrap';
import { Filters } from './Filters';
import { Highlights } from './Highlights';
import type { Highlight, Filter } from '../../actions';

type Props = {
  detailsOpen: boolean,
  handleSubmit: (SyntheticEvent<HTMLButtonElement>) => void,
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
  filterList: Filter[],
  filterActions: {
    removeFilter: (string) => void,
    toggleFilter: (string) => void,
    toggleFilterInverse: (string) => void
  },
  highlightList: Highlight[],
  highlightActions: {
    removeHighlight: (string) => void,
    toggleHighlight: (string) => void,
    toggleHighlightLine: (string) => void
  },
  server?: string,
  url?: string,
  build: string,
  setURLRef: (?HTMLInputElement) => void,
  valueJIRA: string
}

export class CollapseMenu extends React.PureComponent<Props> {
  showLogBox() {
    if (this.props.server) {
      return (
        <FormGroup controlId="urlInput">
          <Col componentClass={ControlLabel} lg={1}>Log</Col>
          <Col lg={6}>
            <FormControl
              type="text"
              defaultValue={this.props.url}
              placeholder="optional. custom file location iff used with local server"
              inputRef={this.props.setURLRef}
            />
          </Col>
          <Col lg={1}> <Button type="submit"> Apply </Button> </Col>
        </FormGroup>
      );
    }
  }

  showJobLogs() {
    if (!this.props.server) {
      return (<Col lg={1}><Button href={'/build/' + this.props.build}>Job Logs</Button></Col>);
    }
  }

  showRaw() {
    if (!this.props.server) {
      return (<Col lg={1}><Button href={'/build/' + this.props.build + '/all?raw=1'}>Raw</Button></Col>);
    }
  }

  showHTML() {
    if (!this.props.server) {
      return (<Col lg={1}><Button href={'/build/' + this.props.build + '/all?html=1'}>HTML</Button></Col>);
    }
  }

  render() {
    return (
      <Collapse className="collapse-menu" in={this.props.detailsOpen}>
        <div>
          <Form horizontal onSubmit={this.props.handleSubmit}>
            {this.showLogBox()}
            <FormGroup controlId="collapseButtons">
              <Button>Hello</Button>
              <Col componentClass={ControlLabel} lg={1}>Wrap</Col>
              <Col lg={1}><ToggleButton value={this.props.settings.wrap} onToggle={this.props.toggleSettings.toggleWrap} /></Col>
              <Col componentClass={ControlLabel} lg={1}>Case Sensitive</Col>
              <Col lg={1}><ToggleButton value={this.props.settings.caseSensitive} onToggle={this.props.toggleSettings.toggleCaseSensitive} /></Col>
              <Col componentClass={ControlLabel} lg={1}>Filter Logic</Col>
              <Col lg={1}><ToggleButton inactiveLabel={'OR'} activeLabel={'AND'} value={this.props.settings.filterIntersection} onToggle={this.props.toggleSettings.toggleFilterIntersection} /></Col>
              <Col componentClass={ControlLabel} lg={1}>JIRA</Col>
              <Col lg={1}><textarea readOnly className="unmoving" value={this.props.valueJIRA}></textarea></Col>
              {this.showJobLogs()}
              {this.showRaw()}
              {this.showHTML()}
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
