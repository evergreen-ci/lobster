// @flow strict

import React from 'react';
import { ToggleButton, ToggleButtonGroup, Button } from 'react-bootstrap';
import type { Filter as FilterType } from '../../actions';

type FilterProps = {
  filter: FilterType,
  removeFilter: () => ((string) => void),
  toggleFilter: () => ((string) => void),
  toggleFilterInverse: () => ((string) => void)
}

type FiltersProps = {
  filters: FilterType[],
  removeFilter: (string) => void,
  toggleFilter: (string) => void,
  toggleFilterInverse: (string) => void
}

export const Filters = (props: FiltersProps) => {
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

export class Filter extends React.PureComponent<FilterProps> {
  removeFilter = () => this.props.removeFilter(this.props.filter.text);
  toggleFilter = () => this.props.toggleFilter(this.props.filter.text);
  toggleFilterInverse = () => this.props.toggleFilterInverse(this.props.filter.text);

  render() {
    return (
      <div className="filter-highlight-lines">
        <Button className="exit-button" onClick={this.removeFilter} bsStyle="danger" bsSize="xsmall">{'\u2715'}</Button>
        <span className="filter-highlight-label">Filter Options</span>
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
        <span className="filter-highlight-text">{this.props.filter.text}</span>
      </div>
    );
  }
}
