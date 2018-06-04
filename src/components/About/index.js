import Jumbotron from 'react-bootstrap/lib/Jumbotron'; // eslint-disable-line no-unused-vars

import './style.css';

const About = () => (
  <Jumbotron>
    <p>
  Lobster is a log viewer implemented as a React-based frontend.  It also includes a node based dummy backend to view local log files or cache the results locally.
    </p>
    <p> Lobster can: </p>
    <ul>
      <li>search any bookmarked or filtered lines by regexp (the "Find" button). If the regexp finds multiple occurrences in the same log line, it will only count one, but it will highlight them all. As of now, it will also not scroll to the right if the matching text is off screen.</li>
      <li>apply multiple regexp filters to the log lines returned by the backend (the "Add Filter" button)</li>
      <li>pause and play filters</li>
      <li>filter a regexp in or out</li>
      <li>cache the recently accessed files locally to improve load time. It can be set with the --cache</li>
      <li>view the local log files generated with resmoke.py . the option --logs sets the absolute path that is available to the server for read
  server command line argument</li>
      <li>once it is supported by the mongod and mongos binaries it will link the log lines of the evergreen
log viewer raw output to the corresponding lines of code that printed them. This feature is available in a demo-mode with the <a href="https://evergreen.mongodb.com/build/mongodb_mongo_master_linux_64_debug_patch_2318942c2ec98c0107a83d72f352d2878490ce09_598117962fbabe1e0f0d5c3c_17_08_02_00_08_20">POC evergreen build</a>.</li>
      <li>double click on a line number to bookmark (or unbookmark) that line and click on that number on the left-hand side to scroll to it.</li>
      <li>click on the 'wrap' toggle to turn line wrapping on and off</li>
      <li>the JIRA text area displays text you can copy into a JIRA ticket to properly format all bookmarked lines</li>
    </ul>
    <p>
    </p>
    <p>
   To run the server locally follow the <a href="https://github.com/evergreen-ci/lobster/tree/master">readme</a>. To query the local server instead of logkeeper, append <b>?server=host:9000/api/log</b> to the url.
    </p>
    <p>
   Lobster is an easy to extend system. Feel free to make changes: here is the <a href="https://github.com/evergreen-ci/lobster/tree/master">source</a>.
    </p>
    <p>
   NOTE: Lobster only renders the logs on the screen. As a result, the browser's "find" functionality only searches the current window. Use lobster's find feature instead.
    </p>
  </Jumbotron>
);

export default About;
