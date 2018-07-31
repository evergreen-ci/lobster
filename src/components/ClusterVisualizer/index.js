// @flow strict

import React from 'react';
import type { Node as ReactNode } from 'react';
import { connect } from 'react-redux';
import { type Event } from '../../models';
import { vega } from 'vega';
import { jQuery } from 'jquery';

type Props = {|
  events: Event[]
|}

type State = {|
  opts: {[key: string]: boolean},
  views: [],
  spec: {}
|}

export class ClusterVisualizer extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      opts: {
        'actions': false
      },
      views: [],
      spec: {}
    };
  }

  componentDidUpdate() {
    vega.embed('#testGraph', this.state.spec, this.state.opts).then(function(result) {
      const newViews = this.state.views.slice();
      newViews.push(result.view);
      this.setState({ views: newViews });
      // vegaTooltip.vega(result.view, tooltipOptions);
    });
  }

  withSpec = (filename: string, events: Event[], callback: (string) => ?ReactNode) => {
    const res = jQuery.getJSON('./' + filename, function(data) {
      data.data[0].values = events;
      this.setState({ spec: data });
      callback(data);
    }).fail(function() { console.log('failed!'); });
    console.log(res);
  }

  graph = (graphDivId: string): ?ReactNode => {
    console.log('graph');
    return (<div id={graphDivId} className="width: 100%"></div>);
  }

  render() {
    return (
      this.withSpec('test.json', this.props.events, function() {
        this.graph('testGraph');
      })
    );
  }
}

function mapStateToProps(state, ownProps) {
  return { ...state, ...ownProps, events: state.log.events };
}

export default connect(mapStateToProps, undefined)(ClusterVisualizer);
