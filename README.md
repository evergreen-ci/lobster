# Lobster

## What is Lobster
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

# Dev Guide

## Running locally
* `git clone https://github.com/evergreen-ci/lobster.git`
* `cd lobster`
* `npm install`
* `node server`
* You can now view lobster by going to `http://<Host>:<Port>/lobster?server=<Host>:<Port>/api/log`.
The root directory for the local server is build`./build `, so you can place local log files in this directory to allow them to be resolved by the local server.

## Building
`npm build` will place build artifacts inside the `build` directory

## Testing

The testing framework is Jest, with Enzyme. See src/example.spec.js for a sample
of how to test with these tools

To run in local development:
`npm test`

This will watch the lobster development directory for changes, and automatically retest your code

## Linting
`npm run-scripts eslint`

This will watch the lobster development directory for changes, and automatically relint your code

## In CI
The above two commands can be run as test-ci or eslint-ci, which will output a
junit compatible xml file as either test-junit.xml or lint-junit.xml
