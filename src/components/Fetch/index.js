// @flow strict

import React from "react";
import type { Node as ReactNode } from "react";
import * as actions from "../../actions";
import "./style.css";
import LogView from "../LogView/index";
import Bookmarks from "./Bookmarks";
import { connect } from "react-redux";
import Toolbar from "./Toolbar";
import * as selectors from "../../selectors";
import type { Dispatch } from "redux";
import type { ReduxState, LogIdentity, Line } from "../../models";
import type { ContextRouter } from "react-router-dom";

type Props = {
  lines: Line[],
  logIdentity: ?LogIdentity,
  loadLogByIdentity: (LogIdentity) => void,
} & ContextRouter;

export class Fetch extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
    if (this.props.logIdentity != null) {
      this.props.loadLogByIdentity(this.props.logIdentity);
    }
  }

  showLines(): ?ReactNode {
    if (!this.props.lines) {
      return <div />;
    }
    return <LogView />;
  }

  render() {
    return (
      <div>
        <Bookmarks />
        <div className="main">
          <Toolbar />
          <div className="log-list">{this.showLines()}</div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state: ReduxState, ownProps: $Shape<Props>) {
  return {
    ...ownProps,
    lines: selectors.getLogLines(state),
  };
}

function mapDispatchToProps(dispatch: Dispatch<*>, ownProps) {
  return {
    ...ownProps,
    loadLogByIdentity: (identity: LogIdentity) =>
      dispatch(actions.loadLog(identity)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Fetch);
