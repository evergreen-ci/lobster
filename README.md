# Lobster

## Quick Start
* `git clone https://github.com/evergreen-ci/lobster.git`
* `cd lobster`
* `npm install`
* `npm build`
* `node server --logs ./path/to/local/logs`
You can now view lobster by going to `http://localhost:9000/lobster?server=localhost:9000/api/log`.

Type `node server --help` for additional options, including the option to bind
to 0.0.0.0

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

## Running locally
* `git clone https://github.com/evergreen-ci/lobster.git`
* `cd lobster`
* `npm install`
* `npm run build`
* `node server`
* You can now view lobster by going to `http://localhost:9000/lobster?server=localhost:9000/api/log`.

The root directory for the local server is build`./build `, so you can place local log files in this directory to allow them to be resolved by the local server.

# Dev Guide
## Structure
* ./src/actions: Redux actions, including their typedefs
* ./src/api: functions for interacting with APIs
* ./src/components: React components
* ./src/models: typedefs for various structures that are not actions
* ./src/reducers: Redux action processors aka. reducers
* ./src/selectors: Redux selectors (functions to compute derived state, or simply
  get state from the store)
* ./src/sagas: redux sagas (asynchronous code like API fetches)
* ./src/thirdparty: directory for vendoring 3rd party code that requires an
  ES6 compatible minifier (which create-react-app doesn't support)

## Running locally
For development use, after running `npm install`, simply run `npm start`. This
will automatically recompile your code and refresh the browser

## Building
`npm build` will place build artifacts inside the `build` directory

## Testing
The testing framework is Jest, with Enzyme.

To run in local development:
`npm test`

This will watch the lobster development directory for changes, and automatically retest your code

The end-to-end tests can be run with `npm run-scripts test:e2e`.
`chromedriver` must be your system's path, and it must be able to start Chrome.
You can also run these tests with Firefox with `npm run-scripts test:e2e -- --browser firefox`,
but `geckodriver` must be in your path.

## Flow

Flow is Facebook's static typing system for Javascript. You can run this
with `npm run-scripts flow`.

## Linting
`npm run-scripts lint` to run the linter; `npm run-scripts lint:fix` will fix automatically fixable lints
