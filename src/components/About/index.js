import React from 'react';

import './style.css';

const About = () => (
  <div>
  <p>
  Lobster is a log viewer implemented as a React-based frontend. As such its an easy to extend system. It also includes a node based dummy backend it needs to load files from the provided in the Log field URI and optionally caches the results locally.
</p>

<p> Lobster can: </p>
<ul>
<li>apply a regexp filter to the log lines returned by the backend (the filter field)</li>
<li>cache the recently accessed files locally to imporve load time. It can be set with the --cache
  server command line argument</li>
<li>once it is supported by the mongod and mongos binaries it will link the log lines of the evergreen 
log viewer raw output to the corresponding lines of code that printed them (those line are 
hightlighted). This feature is available in a demo-mode with the POC evergreen build:</li>
</ul>
<p>
For the demo purpose you can set the log filed to <i><b>https://logkeeper.mongodb.org/build/db6fa7c6a6d5fae2c959dd0996b71ead/test/59811f87c2ab68415701df6d?raw=1</b></i> and the filter to <b><i>d21760</i></b>, however the filter can be empty.
 and click on the navy colored lines to get to the corresponding github line.

  Here is the link to an evergreen patch that produced augmented logs: 
  <a href='https://evergreen.mongodb.com/build/mongodb_mongo_master_linux_64_debug_patch_2318942c2ec98c0107a83d72f352d2878490ce09_598117962fbabe1e0f0d5c3c_17_08_02_00_08_20'> sample run on evergreen</a>. As you can see it adds githash element to a log line where the log()  macro is called.
  </p>
  </div>
)

export default About;
