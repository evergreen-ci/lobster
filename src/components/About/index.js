import React from 'react';
import Jumbotron from 'react-bootstrap/lib/Jumbotron';

import './style.css';

const About = () => (
  <Jumbotron>
    <p>
  Lobster is a log viewer implemented as a React-based frontend.  It also includes a node based backend to view local log files or cache the results locally.
    </p>
    <p> Lobster can: </p>
    <ul>
      <li>search any bookmarked or filtered lines by regexp (the &quot;Find&quot; button). If the regexp finds multiple occurrences in the same log line, it will only count one, but it will highlight them all. As of now, it will also not scroll to the right if the matching text is off screen.</li>
      <li>apply one or more regexp filters to the log lines (the &quot;Add Filter&quot; button)</li>
      <li>enable and disable filters</li>
      <li>match or inverse match filters</li>
      <li>cache the recently accessed files locally to improve load time. It can be set with the --cache if running Lobster locally</li>
      <li>view locally-stored log files. If running Lobster locally, the option --logs sets the absolute path that is available to the server for read server command line argument</li>
      <li>double click on a line number to bookmark (or unbookmark) that line and click on that number on the left-hand side to jump to it</li>
      <li>click on the &apos;Wrap&apos; toggle to turn line wrapping on and off</li>
      <li>pre-format all bookmarked lines for display in JIRA. The JIRA text area contains the formatted bookmark content</li>
      <li>...and more!</li>
    </ul>
    <p>
    </p>
    <p>
   To run Lobster locally follow the <a href="https://github.com/evergreen-ci/lobster/tree/master">readme</a>. To query the local server instead of logkeeper, append <b>?server=host:9000/api/log</b> to the url.
    </p>
    <p>
   Lobster is an easy to extend system. Feel free to make changes: here is the <a href="https://github.com/evergreen-ci/lobster/tree/master">source</a>.
    </p>
    <p>
   NOTE: Lobster only renders the logs on the screen. As a result, the browser&apos;s &quot;find&quot; functionality only searches the current window. Use lobster&apos;s find feature instead.
    </p>
  </Jumbotron>
);

export default About;
