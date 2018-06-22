import Button from 'react-bootstrap/lib/Button';
import React from 'react';
import PropTypes from 'prop-types';
import {ToggleButton, ToggleButtonGroup} from 'react-bootstrap';

export const Highlights = (props) => {
  return (
    <div className="highlightBox">
      <div className="highlight-box">{props.highlights.map(function(highlight) {
        return (
          <Highlight
            key={JSON.stringify(highlight)}
            highlight={highlight}
            removeHighlight={props.removeHighlight}
            toggleHighlight={props.toggleHighlight}
            toggleHighlightLine={props.toggleHighlightLine}
          />
        );
      })}
      </div>
    </div>
  );
};

Highlights.propTypes = {
  highlights: PropTypes.arrayOf(PropTypes.shape({
    text: PropTypes.string.isRequired,
    on: PropTypes.bool.isRequired,
    line: PropTypes.bool.isRequired
  })).isRequired,
  removeHighlight: PropTypes.func.isRequired,
  toggleHighlight: PropTypes.func.isRequired,
  toggleHighlightLine: PropTypes.func.isRequired
};

export class Highlight extends React.PureComponent {
  static propTypes = {
    highlight: PropTypes.shape({
      text: PropTypes.string.isRequired,
      on: PropTypes.bool.isRequired,
      line: PropTypes.bool.isRequired
    }).isRequired,
    removeHighlight: PropTypes.func.isRequired,
    toggleHighlight: PropTypes.func.isRequired,
    toggleHighlightLine: PropTypes.func.isRequired
  };

  removeHighlight = () => this.props.removeHighlight(this.props.highlight.text);
  toggleHighlight = () => this.props.toggleHighlight(this.props.highlight.text);
  toggleHighlightLine = () => this.props.toggleHighlightLine(this.props.highlight.text);

  render() {
    const buttonStyles = { marginLeft: '12px'};
    const lineStyles = { marginBottom: '5px'};
    return (
      <div style={lineStyles}>
        <Button className="filter-button" onClick={this.removeHighlight} bsStyle="danger" bsSize="xsmall">{'\u2715'}</Button>
        <span className="filter-label-text">Highlight Options</span>
        <ToggleButtonGroup
          style={buttonStyles}
          type="radio"
          name="highlight-on-off"
          value={this.props.highlight.on}
          onChange={this.toggleHighlight}
        >
          <ToggleButton value={true} bsSize="small" bsStyle="info">
              on
          </ToggleButton>
          <ToggleButton value={false} bsSize="small" bsStyle="info">
              off
          </ToggleButton>
        </ToggleButtonGroup>
        <ToggleButtonGroup
          style={buttonStyles}
          type="radio"
          name="filter-inverse"
          value={this.props.highlight.line}
          onChange={this.toggleHighlightLine}
        >
          <ToggleButton value={false} bsSize="small" bsStyle="primary">
            word
          </ToggleButton>
          <ToggleButton value={true} bsSize="small" bsStyle="primary">
            line
          </ToggleButton>
        </ToggleButtonGroup>
        <span className="filter-text">{this.props.highlight.text}</span>
      </div>
    );
  }
}
