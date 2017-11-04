import React from 'react';
import Jumbotron from 'react-bootstrap/lib/Jumbotron';

import './style.css';

const About = () => (
<Jumbotron>
  <p>
  Lobster is a log viewer implemented as a React-based frontend.  It also includes a node based dummy backend to optionally cache the results locally.
</p>
<p> Lobster can: </p>
<ul>
<li>apply a regexp filter to the log lines returned by the backend (the filter field)</li>
<li>scroll to a specific line number (the "scroll to line" field)</li>
<li>cache the recently accessed files locally to improve load time. It can be set with the --cache
  server command line argument</li>
<li>once it is supported by the mongod and mongos binaries it will link the log lines of the evergreen 
log viewer raw output to the corresponding lines of code that printed them (those line are 
hightlighted). This feature is available in a demo-mode with the <a href='https://evergreen.mongodb.com/build/mongodb_mongo_master_linux_64_debug_patch_2318942c2ec98c0107a83d72f352d2878490ce09_598117962fbabe1e0f0d5c3c_17_08_02_00_08_20'>POC evergreen build</a>.</li>
<li>double click on a line number to bookmark (or unbookmark) that line and click on that number on the left-hand side to scroll to it.</li>
<li>click on the 'wrap' toggle to turn line wrapping on and off</li>
</ul>
<p>
</p>
<p>
   To run the server locally follow the <a href='https://github.com/10gen/kernel-tools/tree/master/lobster'>readme</a>. To query the local server instead of logkeeper, append <b>?server=host:9000/api/log</b> to the url.
</p>
<p>
   Lobster is an easy to extend system feel free to make changes: here is the <a href='https://github.com/10gen/kernel-tools/tree/master/lobster'>source</a>.
</p>
<p>
   NOTE: Lobster only renders the logs on the screen. As a result, the browser's 'find' functionality only searches the current window.
</p>
</Jumbotron>
)

export default About;
