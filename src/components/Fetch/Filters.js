import Button from 'react-bootstrap/lib/Button';
import React from 'react';
import PropTypes from 'prop-types';

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
    inverse: PropTypes.bool.isRequired,
    highlight: PropTypes.bool.isRequired
  })).isRequired,
  removeFilter: PropTypes.func.isRequired,
  toggleFilter: PropTypes.func.isRequired,
  toggleFilterInverse: PropTypes.func.isRequired,
  toggleFilterHighlight: PropTypes.func.isRequired
};

export class Filter extends React.PureComponent {
  static propTypes = {
    filter: PropTypes.shape({
      text: PropTypes.string.isRequired,
      on: PropTypes.bool.isRequired,
      inverse: PropTypes.bool.isRequired,
      highlight: PropTypes.bool.isRequired
    }).isRequired,
    removeFilter: PropTypes.func.isRequired,
    toggleFilter: PropTypes.func.isRequired,
    toggleFilterInverse: PropTypes.func.isRequired,
    toggleFilterHighlight: PropTypes.func.isRequired
  };

  removeFilter = () => this.props.removeFilter(this.props.filter.text);
  toggleFilter = () => this.props.toggleFilter(this.props.filter.text);
  toggleFilterInverse = () => this.props.toggleFilterInverse(this.props.filter.text);
  toggleFilterHighlight = () => this.props.toggleFilterHighlight(this.props.filter.text);

  render() {
    return (
      <div className="filter">
        <Button className="filter-button" onClick={this.removeFilter} bsStyle="danger" bsSize="xsmall">{'\u2715'}</Button>
        <Button className="filter-button" onClick={this.toggleFilter} bsStyle="warning" bsSize="xsmall">{this.props.filter.on ? '||' : '\u25B6'}</Button>
        <Button className="filter-button-big" onClick={this.toggleFilterInverse} bsStyle="success" bsSize="xsmall">{this.props.filter.inverse ? 'out' : 'in'}</Button>
        <Button className="filter-button-big" onClick={this.toggleFilterHighlight} bsStyle="success" bsSize="xsmall">{this.props.filter.highlight ? 'on' : 'off'}</Button>
        <span className="filter-text">{this.props.filter.text}</span>
      </div>
    );
  }
}
