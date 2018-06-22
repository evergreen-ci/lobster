import Button from 'react-bootstrap/lib/Button';
import React from 'react';
import PropTypes from 'prop-types';
import {ToggleButton, ToggleButtonGroup} from 'react-bootstrap';

export const Filters = (props) => {
  return (
    <div className="filterBox">
      <div className="filter-box">{props.filters.map(function(filter) {
        return (
          <Filter
            key={JSON.stringify(filter)}
            filter={filter}
            removeFilter={props.removeFilter}
            toggleFilter={props.toggleFilter}
            toggleFilterInverse={props.toggleFilterInverse}
            toggleFilterHighlight={props.toggleFilterHighlight}
            toggleHighlightLine={props.toggleHighlightLine}
          />
        );
      })}
      </div>
    </div>
  );
};

Filters.propTypes = {
  filters: PropTypes.arrayOf(PropTypes.shape({
    text: PropTypes.string.isRequired,
    on: PropTypes.bool.isRequired,
    highlight: PropTypes.bool.isRequired,
    highlightLine: PropTypes.bool.isRequired,
    inverse: PropTypes.bool.isRequired
  })).isRequired,
  removeFilter: PropTypes.func.isRequired,
  toggleFilter: PropTypes.func.isRequired,
  toggleFilterInverse: PropTypes.func.isRequired,
  toggleFilterHighlight: PropTypes.func.isRequired,
  toggleHighlightLine: PropTypes.func.isRequired
};

export class Filter extends React.PureComponent {
  static propTypes = {
    filter: PropTypes.shape({
      text: PropTypes.string.isRequired,
      on: PropTypes.bool.isRequired,
      highlight: PropTypes.bool.isRequired,
      highlightLine: PropTypes.bool.isRequired,
      inverse: PropTypes.bool.isRequired
    }).isRequired,
    removeFilter: PropTypes.func.isRequired,
    toggleFilter: PropTypes.func.isRequired,
    toggleFilterInverse: PropTypes.func.isRequired,
    toggleFilterHighlight: PropTypes.func.isRequired,
    toggleHighlightLine: PropTypes.func.isRequired
  };

  removeFilter = () => this.props.removeFilter(this.props.filter.text);
  toggleFilter = () => this.props.toggleFilter(this.props.filter.text);
  toggleFilterInverse = () => this.props.toggleFilterInverse(this.props.filter.text);
  toggleFilterHighlight = () => this.props.toggleFilterHighlight(this.props.filter.text);
  toggleHighlightLine = () => this.props.toggleHighlightLine(this.props.filter.text);

  render() {
    // old buttons
    /*

      <Button className="filter-button-big" onClick={this.toggleFilter} bsStyle="warning" bsSize="xsmall">{this.props.filter.on ? 'filter off' : 'filter on'}</Button>
      <Button className="filter-button-xbig" onClick={this.toggleFilterHighlight} bsStyle="info" bsSize="xsmall">{this.props.filter.highlight ? 'highlight off' : 'highlight on'}</Button>
      <Button className="filter-button-big" onClick={this.toggleHighlightLine} bsStyle="primary" bsSize="xsmall">{this.props.filter.highlightLine ? 'words' : 'lines'}</Button>
      <Button className="filter-button-big" onClick={this.toggleFilterInverse} bsStyle="success" bsSize="xsmall">{this.props.filter.inverse ? 'match' : 'inverse'}</Button>
    */
    const buttonStyles = { marginLeft: '10px' };
    return (
      <div>
        <Button className="filter-button" onClick={this.removeFilter} bsStyle="danger" bsSize="xsmall">{'\u2715'}</Button>
        <ToggleButtonGroup
          style={buttonStyles}
          type="radio"
          name="filter-on-off"
          value={this.props.filter.on}
          onChange={this.toggleFilter}
        >
          <div>Filter</div>
          <ToggleButton value={true} bsSize="xsmall" bsStyle="warning">
            on
          </ToggleButton>
          <ToggleButton value={false} bsSize="xsmall" bsStyle="warning">
            off
          </ToggleButton>
        </ToggleButtonGroup>
        <ToggleButtonGroup
          style={buttonStyles}
          type="radio"
          name="filter-highlight"
          value={this.props.filter.highlight}
          onChange={this.toggleFilterHighlight}
        >
          <div>Highlight</div>
          <ToggleButton value={true} bsSize="xsmall" bsStyle="info">
            on
          </ToggleButton>
          <ToggleButton value={false} bsSize="xsmall" bsStyle="info">
            off
          </ToggleButton>
        </ToggleButtonGroup>
        <ToggleButtonGroup
          style={buttonStyles}
          type="radio"
          name="filter-line-word"
          value={this.props.filter.highlightLine}
          onChange={this.toggleHighlightLine}
        >
          <ToggleButton value={true} bsSize="xsmall" bsStyle="primary">
            line
          </ToggleButton>
          <ToggleButton value={false} bsSize="xsmall" bsStyle="primary">
            word
          </ToggleButton>
        </ToggleButtonGroup>
        <ToggleButtonGroup
          style={buttonStyles}
          type="radio"
          name="filter-inverse"
          value={this.props.filter.inverse}
          onChange={this.toggleFilterInverse}
        >
          <ToggleButton value={true} bsSize="xsmall" bsStyle="success">
            inverse
          </ToggleButton>
          <ToggleButton value={false} bsSize="xsmall" bsStyle="success">
            match
          </ToggleButton>
        </ToggleButtonGroup>
        <span className="filter-text">{this.props.filter.text}</span>
      </div>
    );
  }
}
