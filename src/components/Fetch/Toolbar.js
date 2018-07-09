import React from 'react';
import PropTypes from 'prop-types';
import './style.css';
import Button from 'react-bootstrap/lib/Button';
import ButtonToolbar from 'react-bootstrap/lib/ButtonToolbar';
import Form from 'react-bootstrap/lib/Form';
import FormControl from 'react-bootstrap/lib/FormControl';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import Col from 'react-bootstrap/lib/Col';
import CollapseMenu from './CollapseMenu';
import { connect } from 'react-redux';
import * as actions from '../../actions';

export class Toolbar extends React.Component {
  static propTypes = {
    setFormRef: PropTypes.func.isRequired,
    settings: PropTypes.shape({
      wrap: PropTypes.bool.isRequired,
      caseSensitive: PropTypes.bool.isRequired,
      filterIntersection: PropTypes.bool.isRequired
    }),
    toggleSettings: PropTypes.shape({
      toggleWrap: PropTypes.func.isRequired,
      toggleCaseSensitive: PropTypes.func.isRequired,
      toggleFilterIntersection: PropTypes.func.isRequired
    }).isRequired,
    handleChangeFindEvent: PropTypes.func.isRequired,
    searchRegex: PropTypes.string.isRequired,
    find: PropTypes.func.isRequired,
    addFilter: PropTypes.func.isRequired,
    filterActions: PropTypes.shape({
      removeFilter: PropTypes.func.isRequired,
      toggleFilter: PropTypes.func.isRequired,
      toggleFilterInverse: PropTypes.func.isRequired
    }),
    filterList: PropTypes.array.isRequired,
    highlightList: PropTypes.array.isRequired,
    addHighlight: PropTypes.func.isRequired,
    highlightActions: PropTypes.shape({
      removeHighlight: PropTypes.func.isRequired,
      toggleHighlight: PropTypes.func.isRequired,
      toggleHighlightLine: PropTypes.func.isRequired
    }),
    togglePanel: PropTypes.func.isRequired,
    detailsOpen: PropTypes.bool.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    server: PropTypes.string,
    url: PropTypes.string,
    build: PropTypes.string.isRequired,
    setURLRef: PropTypes.func.isRequired,
    valueJIRA: PropTypes.string.isRequired,
    findIdx: PropTypes.number.isRequired,
    findResults: PropTypes.array.isRequired,
    changeFindIdx: PropTypes.func.isRequired,
    changeSearch: PropTypes.func.isRequired,
    setScroll: PropTypes.func.isRequired
  };

  shouldComponentUpdate(nextProps, _nextState) {
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
            <Button onClick={this.nextFind}>Next</Button>
            <Button onClick={this.prevFind}>Prev</Button>
          </span>);
      }
      return <Col lg={1} componentClass={ControlLabel} className="not-found" >Not Found</Col>;
    }
  }

  nextFind = () => {
    let nextIdx = this.props.findIdx + 1;
    if (nextIdx === this.props.findResults.length) {
      nextIdx = 0;
    }
    this.props.changeFindIdx(nextIdx);
    this.props.setScroll(this.props.findResults[nextIdx]);
  }

  prevFind = () => {
    let nextIdx = this.props.findIdx - 1;
    if (nextIdx === -1) {
      nextIdx = this.props.findResults.length - 1;
    }
    this.props.changeFindIdx(nextIdx);
    this.props.setScroll(this.props.findResults[nextIdx]);
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

function mapDispatchToProps(dispatch, ownProps) {
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
    changeSearch: (text) => dispatch(actions.changeSearch(text))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Toolbar);
