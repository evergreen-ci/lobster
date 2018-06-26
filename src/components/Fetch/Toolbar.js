import React from 'react';
import PropTypes from 'prop-types';
import './style.css';
import Button from 'react-bootstrap/lib/Button';
import Form from 'react-bootstrap/lib/Form';
import FormControl from 'react-bootstrap/lib/FormControl';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import Col from 'react-bootstrap/lib/Col';
import { CollapseMenu } from './CollapseMenu';

export class Toolbar extends React.Component {
  static propTypes = {
    setFormRef: PropTypes.func.isRequired,
    handleChangeFindEvent: PropTypes.func.isRequired,
    find: PropTypes.func.isRequired,
    showFind: PropTypes.func.isRequired,
    addFilter: PropTypes.func.isRequired,
    togglePanel: PropTypes.func.isRequired,
    detailsOpen: PropTypes.bool.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    wrap: PropTypes.bool.isRequired,
    toggleWrap: PropTypes.func.isRequired,
    caseSensitive: PropTypes.bool.isRequired,
    toggleCaseSensitive: PropTypes.func.isRequired,
    filterIntersection: PropTypes.bool.isRequired,
    toggleFilterIntersection: PropTypes.func.isRequired,
    filterList: PropTypes.object.isRequired,
    removeFilter: PropTypes.func.isRequired,
    toggleFilter: PropTypes.func.isRequired,
    toggleFilterInverse: PropTypes.func.isRequired,
    server: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    build: PropTypes.string.isRequired,
    setURLRef: PropTypes.func.isRequired,
    valueJIRA: PropTypes.string.isRequired
  };

  shouldComponentUpdate(nextProps, _nextState) {
    if (nextProps.detailsOpen !== this.props.detailsOpen) {
      return true;
    }
    if (nextProps.wrap !== this.props.wrap) {
      return true;
    }
    if (nextProps.caseSensitive !== this.props.caseSensitive) {
      return true;
    }
    if (nextProps.filterList !== this.props.filterList) {
      return true;
    }
    return false;
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
              <Button id="formSubmit" type="submit" onClick={this.props.find}>Find</Button>
              {this.props.showFind}
              <Button onClick={this.props.addFilter}>Add Filter</Button>
              <Button onClick={this.props.togglePanel}>{this.props.detailsOpen ? 'Hide Details' : 'Show Details'}</Button>
            </FormGroup>
          </Form>
          <CollapseMenu
            detailsOpen={this.props.detailsOpen}
            handleSubmit={this.props.handleSubmit}
            wrap={this.props.wrap}
            toggleWrap={this.props.toggleWrap}
            caseSensitive={this.props.caseSensitive}
            toggleCaseSensitive={this.props.toggleCaseSensitive}
            filterIntersection={this.props.filterIntersection}
            toggleFilterIntersection={this.props.toggleFilterIntersection}
            filterList={this.props.filterList}
            removeFilter={this.props.removeFilter}
            toggleFilter={this.props.toggleFilter}
            toggleFilterInverse={this.props.toggleFilterInverse}
            server={this.props.server}
            url={this.props.url}
            build={this.props.build}
            setURLRef={this.props.setURLRef}
            valueJIRA={this.props.valueJIRA}
          />
        </div>
      </Col>
    );
  }
}
