import React from 'react';

import './style.css';

const About = () => (
  <div>
  <p>
  This is a POC for a log viewer that can link the log lines in the evergreen log viewer raw output 
  to the corresponding lines of code that printed them. Also it can apply an reg exp filter to the log lines before they returned to the browser.
  </p>
  It has two parts:
  <ul>
  <li>React based frontend that shows the logs returned by the backend and hightlights the lines that can be linked to the corresponding code line in the github</li>
  <li>The server needed a change to the log() function to become a macro so it can print the location of its own call </li>
  </ul>
  Here is the link to an evergreen patch that produced augmented logs: 
  <a href='https://evergreen.mongodb.com/build/mongodb_mongo_master_linux_64_debug_patch_2318942c2ec98c0107a83d72f352d2878490ce09_598117962fbabe1e0f0d5c3c_17_08_02_00_08_20'> sample run on evergreen</a>. As you can see it adds githash element to a log line where the log()  macro is called.
  <p>
  For the demo purpose I try setting log to <i>https://logkeeper.mongodb.org/build/db6fa7c6a6d5fae2c959dd0996b71ead/test/59811f87c2ab68415701df6d?raw=1</i> and the filter to <i>d21760</i>, however the filter can be empty.

  </p>
  </div>
)

export default About;
