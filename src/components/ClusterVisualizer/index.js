// @flow strict

import React from 'react';
import type { Node as ReactNode } from 'react';
import { connect } from 'react-redux';
import { type Event } from '../../models';
import vegaEmbed from 'vega-embed'; // vegaEmbed.embed(…)
import vegaTooltip from 'vega-tooltip';
import jQuery from 'jquery';

type Props = {|
  events: Event[]
|}

type State = {|
  opts: {[key: string]: boolean},
  views: [],
  spec: {}
|}

export class ClusterVisualizer extends React.PureComponent<Props, State> {
  baseDiv: ?HTMLDivElement

  constructor(props: Props) {
    super(props);
    this.state = {
      opts: {
        actions: { source: false, editor: false, export: false, compiled: false }
      },
      tooltipsOptions: {
        sanitize: (value) => 'hello' + String(value)
      },
      views: [],
      spec: {}
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.events !== prevProps.events) {
      this.withSpec('test.json', this.props.events);
    }
  }

  componentDidMount() {
    this.withSpec('test.json', this.props.events);
  }

  refCallback = (div: ?HTMLDivElement) => {
    this.baseDiv = div;
  }

  addToViews = (view) => {
    const newViews = this.state.views.slice();
    newViews.push(view);
    this.setState({ views: newViews });
  }

  withSpec = (filename: string, events: Event[]) => {
    console.log('withspec');
    jQuery.getJSON('/' + filename, (data) => {
      console.log('succeeded in downloading file!');
      data.data[0].values = events;
      console.log(events);
      this.setState({ spec: data });
      this.graph();
    }).fail(function() { console.log('failed!'); });
  }

  graph = (): ?ReactNode => {
    if (this.baseDiv != null) {
      vegaEmbed('#clusterVis', this.state.spec, this.state.opts).then((result) => {
        console.log('vega embed success!');
        this.addToViews(result.view);
        vegaTooltip(result.view, this.state.tooltipsOptions);
      });
    }
  }

  render() {
    return (
      <div ref={this.refCallback}>
        <div id="clusterVis" className="width: 100%">asdas</div>
      </div>);
  }
}

function mapStateToProps(state, ownProps) {
  return { ...state, ...ownProps, events: state.log.events };
}

export default connect(mapStateToProps, undefined)(ClusterVisualizer);
