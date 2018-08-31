// @flow strict

import React from 'react';
import './style.css';
import { Overlay, Popover, Button, ButtonToolbar, Form, FormControl, ControlLabel, FormGroup, Col } from 'react-bootstrap';
import CollapseMenu from './CollapseMenu';
import { connect } from 'react-redux';
import { addFilter, addHighlight, search, toggleSettingsPanel, changeSearch } from '../../actions';
import * as selectors from '../../selectors';
import debounce from '../../debounce';
import type { ReduxState, Settings, SearchResults } from '../../models';

type Props = {
  setFormRef: (?HTMLInputElement) => void,
  settings: Settings,
  searchTerm: string,
  searchTermError: ?Error,
  addFilter: (string, boolean) => void,
  addHighlight: (string, boolean) => void,
  wipeCache: () => void,
  togglePanel: () => void,
  detailsOpen: boolean,
  setURLRef: (?HTMLInputElement) => void,
  findIdx: number,
  changeFindIdx: (number) => void,
  nextFind: () => void,
  prevFind: () => void,
  changeSearch: (value: string) => void,
  findResults: SearchResults
};

export class Toolbar extends React.PureComponent<Props> {
  findInput: ?HTMLInputElement

  showFind = () => {
    if (this.props.searchTerm !== '') {
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

  handleChangeFindEvent = () => {
    if (this.findInput != null) {
      const { value } = this.findInput;
      this.props.changeSearch(value);
    }
  }

  handleSearchClickFind = (event: SyntheticMouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (event.shiftKey === true) {
      this.props.prevFind();
    } else {
      this.props.nextFind();
    }
  }

  handleSearchEnterKey = (event: KeyboardEvent) => {
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
    if (this.findInput) {
      const i = this.findInput;
      i.focus();
      i.select();
    }
  }

  handleSearchShortcut = (event: KeyboardEvent) => {
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

  setFindInputRef = (ref: ?HTMLInputElement) => {
    this.findInput = ref;
  }

  addFilter = () => {
    if (!this.findInput) {
      return;
    }
    const { value } = this.findInput;

    this.props.addFilter(value, this.props.settings.caseSensitive);
    // $FlowFixMe
    this.findInput.value = '';
  }

  addHighlight = () => {
    if (!this.findInput) {
      return;
    }
    const { value } = this.findInput;

    this.props.addHighlight(value, this.props.settings.caseSensitive);
    // $FlowFixMe
    this.findInput.value = '';
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleSearchShortcut);
    if (this.findInput) {
      this.findInput.addEventListener('keydown', this.handleSearchEnterKey);
    }
  }
  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleSearchEnterKey);
    if (this.findInput) {
      this.findInput.removeEventListener('keydown', this.handleSearchEnterKey);
    }
  }

  regexValidationState = () => {
    if (this.props.searchTermError != null) {
      return 'error';
    }

    return null;
  }

  render() {
    return (
      <Col lg={11} lgOffset={1}>
        <div className="find-box">
          <Form horizontal>
            <FormGroup controlId="findInput" className="filter-header" validationState={this.regexValidationState()}>
              <Overlay
                show={this.props.searchTermError != null}
                target={this.findInput}
                placement="bottom"
                container={this}
                containerPadding={0}
              >
                <Popover id="popover-contained" title="Invalid search term">
                  {this.props.searchTermError != null ? this.props.searchTermError.toString() : ''}
                </Popover>
              </Overlay>
              <Col lg={6} >
                <FormControl
                  inputRef={this.setFindInputRef}
                  type="text"
                  placeholder="optional. regexp to search for"
                  onChange={this.handleChangeFindEvent}
                />
              </Col>
              <ButtonToolbar>
                <Button id="formSubmit" onClick={this.handleSearchClickFind}>Find</Button>
                {this.showFind()}
                <Button onClick={this.addFilter}>Add Filter</Button>
                <Button onClick={this.addHighlight}>Add Highlight</Button>
                <Button onClick={this.props.togglePanel}>{this.props.detailsOpen ? 'Hide Details \u25B4' : 'Show Details \u25BE'}</Button>
              </ButtonToolbar>
            </FormGroup>
          </Form>
          <CollapseMenu />
        </div>
      </Col>
    );
  }
}

function mapStateToProps(state: ReduxState, ownProps: $Shape<Props>): $Shape<Props> {
  return {
    ...ownProps,
    settings: selectors.getLogViewerSettings(state),
    findIdx: selectors.getLogViewerFindIdx(state),
    searchTerm: selectors.getLogViewerSearchTerm(state),
    searchTermError: selectors.getLogViewerSearchTermError(state),
    detailsOpen: selectors.getIsLogViewerSettingsPanel(state),
    findResults: selectors.getFindResults(state)
  };
}

function mapDispatchToProps(dispatch: Dispatch<*>, ownProps: $Shape<Props>) {
  return {
    ...ownProps,
    togglePanel: () => dispatch(toggleSettingsPanel()),
    nextFind: () => dispatch(search('next')),
    prevFind: () => dispatch(search('prev')),
    changeSearch: (value: string) => dispatch(changeSearch(value)),
    addFilter: (text: string, caseSensitive: boolean) => dispatch(addFilter(text, caseSensitive)),
    addHighlight: (text: string, caseSensitive: boolean) => dispatch(addHighlight(text, caseSensitive))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Toolbar);
