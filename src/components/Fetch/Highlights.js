// @flow strict

import React from 'react';
import { Button, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import type { Highlight as HighlightType } from '../../actions/logviewer';

type HighlightProps = {
  highlight: HighlightType,
  removeHighlight: (string) => void,
  toggleHighlight: (string) => void,
  toggleHighlightLine: (string) => void
}

type HighlightsProps = {
  highlights: HighlightType[],
  removeHighlight: (string) => void,
  toggleHighlight: (string) => void,
  toggleHighlightLine: (string) => void
}

export const Highlights = (props: HighlightsProps) => {
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

export class Highlight extends React.PureComponent<HighlightProps> {
  removeHighlight = () => this.props.removeHighlight(this.props.highlight.text);
  toggleHighlight = () => this.props.toggleHighlight(this.props.highlight.text);
  toggleHighlightLine = () => this.props.toggleHighlightLine(this.props.highlight.text);

  render() {
    return (
      <div className="filter-highlight-lines">
        <Button className="exit-button" onClick={this.removeHighlight} bsStyle="danger" bsSize="xsmall">{'\u2715'}</Button>
        <span className="toggle-label">Highlight Options</span>
        <ToggleButtonGroup
          className="toggle-buttons"
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
          className="toggle-buttons"
          type="radio"
          name="highlight-line-word"
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
        <span className="filter-highlight-text">{this.props.highlight.text}</span>
      </div>
    );
  }
}
