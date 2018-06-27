import React from 'react';
import PropTypes from 'prop-types';
import './style.css';
import Button from 'react-bootstrap/lib/Button';
import ButtonToolbar from 'react-bootstrap/lib/ButtonToolbar';
import Form from 'react-bootstrap/lib/Form';
import FormControl from 'react-bootstrap/lib/FormControl';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import Col from 'react-bootstrap/lib/Col';
import CollapseMenu from './CollapseMenu';

export class Toolbar extends React.Component {
  static propTypes = {
    setFormRef: PropTypes.func.isRequired,
    handleChangeFindEvent: PropTypes.func.isRequired,
    find: PropTypes.func.isRequired,
    showFind: PropTypes.func.isRequired,
    addFilter: PropTypes.func.isRequired,
    addHighlight: PropTypes.func.isRequired,
    togglePanel: PropTypes.func.isRequired,
    detailsOpen: PropTypes.bool.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    filterList: PropTypes.array.isRequired,
    removeFilter: PropTypes.func.isRequired,
    server: PropTypes.string,
    url: PropTypes.string,
    build: PropTypes.string.isRequired,
    setURLRef: PropTypes.func.isRequired,
    valueJIRA: PropTypes.string.isRequired,
    highlightList: PropTypes.array.isRequired,
    removeHighlight: PropTypes.func.isRequired,
    toggleHighlight: PropTypes.func.isRequired,
    toggleHighlightLine: PropTypes.func.isRequired
  };

  shouldComponentUpdate(nextProps, _nextState) {
    if (nextProps.detailsOpen !== this.props.detailsOpen) {
      return true;
    }
    if (nextProps.filterList !== this.props.filterList) {
      return true;
    }
    if (nextProps.highlightList !== this.props.highlightList) {
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
              <ButtonToolbar>
                <Button id="formSubmit" type="submit" onClick={this.props.find}>Find</Button>
                {this.props.showFind()}
                <Button onClick={this.props.addFilter}>Add Filter</Button>
                <Button onClick={this.props.addHighlight}>Add Highlight</Button>
                <Button onClick={this.props.togglePanel}>{this.props.detailsOpen ? 'Hide Details \u25B4' : 'Show Details \u25BE'}</Button>
              </ButtonToolbar>
            </FormGroup>
          </Form>
          <CollapseMenu
            detailsOpen={this.props.detailsOpen}
            handleSubmit={this.props.handleSubmit}
            filterList={this.props.filterList}
            removeFilter={this.props.removeFilter}
            server={this.props.server}
            url={this.props.url}
            build={this.props.build}
            setURLRef={this.props.setURLRef}
            valueJIRA={this.props.valueJIRA}
            highlightList={this.props.highlightList}
            removeHighlight={this.props.removeHighlight}
            toggleHighlight={this.props.toggleHighlight}
            toggleHighlightLine={this.props.toggleHighlightLine}
          />
        </div>
      </Col>
    );
  }
}
