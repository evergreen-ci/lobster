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
    inverse: PropTypes.bool.isRequired
  })).isRequired,
  removeFilter: PropTypes.func.isRequired,
  toggleFilter: PropTypes.func.isRequired,
  toggleFilterInverse: PropTypes.func.isRequired
};

export class Filter extends React.PureComponent {
  static propTypes = {
    filter: PropTypes.shape({
      text: PropTypes.string.isRequired,
      on: PropTypes.bool.isRequired,
      inverse: PropTypes.bool.isRequired
    }).isRequired,
    removeFilter: PropTypes.func.isRequired,
    toggleFilter: PropTypes.func.isRequired,
    toggleFilterInverse: PropTypes.func.isRequired
  };

  removeFilter = () => this.props.removeFilter(this.props.filter.text);
  toggleFilter = () => this.props.toggleFilter(this.props.filter.text);
  toggleFilterInverse = () => this.props.toggleFilterInverse(this.props.filter.text);

  render() {
    const lineStyles = { marginBottom: '5px'};
    return (
      <div style={lineStyles}>
        <Button className="filter-button" onClick={this.removeFilter} bsStyle="danger" bsSize="xsmall">{'\u2715'}</Button>
        <span className="filter-label-text">Filter Options</span>
        <ToggleButtonGroup
          className="filter-highlight-buttons"
          type="radio"
          name="filter-on-off"
          value={this.props.filter.on}
          onChange={this.toggleFilter}
        >
          <ToggleButton value={true} bsSize="small" bsStyle="warning">
              on
          </ToggleButton>
          <ToggleButton value={false} bsSize="small" bsStyle="warning">
              off
          </ToggleButton>
        </ToggleButtonGroup>
        <ToggleButtonGroup
          className="filter-highlight-buttons"
          type="radio"
          name="filter-inverse"
          value={this.props.filter.inverse}
          onChange={this.toggleFilterInverse}
        >
          <ToggleButton value={false} bsSize="small" bsStyle="success">
            match
          </ToggleButton>
          <ToggleButton value={true} bsSize="small" bsStyle="success">
            inverse
          </ToggleButton>
        </ToggleButtonGroup>
        <span className="filter-text">{this.props.filter.text}</span>
      </div>
    );
  }
}
