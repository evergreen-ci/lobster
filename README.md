This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).
You can find the most recent version of this guide [here](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md).

## Lobster

### What is Lobster 
Lobster is a log viewer implemented as a React-based frontend. As such its an easy to extend system.
It also includes a node based dummy backend to load files from the provided URI and optionally cache them locally.

Lobster can:

- apply a regexp filter to the log lines returned by the backend (e.g. ```primary|secondary``` will
  show only lines that has primary or secondary etc.)
- cache the recently accessed files locally to imporve load time. It can be set with the --cache 
  server command line argument (e.g. ```node server --cache=/tmp/lobster```)
- once it's supported by the mongod and mongos binaries it will link the log lines of the evergreen 
log viewer raw output to the corresponding lines of code that printed them (those line are 
hightlighted). This feature is available in a demo-mode with the POC evergreen build: 
You can put ```https://logkeeper.mongodb.org/build/db6fa7c6a6d5fae2c959dd0996b71ead/test/59811f87c2ab68415701df6d?raw=1```
in the Log field and click on the navy colored lines to get to the corresponding github line.

### Up and running
To start the dev version locally 

* ```git clone https://github.com/10gen/kernel-tools.git```
* ```cd kernel-tools/lobster```
* ```npm install```

To run:

* ```npm run build``` wild build the project into ```./build``` directory
* ```node server``` will start the server at ```http://localhost:9000``` and will serve the content from the
* If the server is running locally, go to ```http://<Host>:<Port>/lobster?server=<Host>:<Port>/api/log```
root directory ```./build ```. Hence you can also view the local log files if they are resolved by the
server (i.e. is in ./build).
