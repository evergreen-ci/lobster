# Lobster

## What is Lobster
Lobster is a log viewer implemented as a React-based frontend. As such its an easy to extend system.
It also includes a node based backend to view local log files or cache the results locally.

Lobster can:

- search any bookmarked or filtered lines by regexp (the "Find" button). If the regexp finds multiple occurrences in the same log line, it will only count one, but it will 
  highlight them all
- apply one or more regexp filters to the log lines (the "Add Filter" button)
- enable and disable individual filters
- match or inverse match filters
- cache the recently accessed files locally to improve load time
- view locally-stored log files
- double click on a line number to bookmark (or unbookmark) that line and click on that number on the left-hand side to jump to it
- click on the "Wrap" toggle to turn line wrapping on and off
- pre-format all bookmarked lines for display in JIRA. The JIRA text area contains the formatted bookmark content
- ...and more!

## Running Locally
* `git clone https://github.com/evergreen-ci/lobster.git`
* `cd lobster`
* `npm install`
* `npm build`
* `node server --logs ./path/to/local/logs`
You can now view lobster by going to `http://localhost:9000/lobster?server=localhost:9000/api/log`.

Type `node server --help` for additional options, including the option to bind
to 0.0.0.0

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
