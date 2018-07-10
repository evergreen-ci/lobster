import React from 'react';
import Enzyme from 'enzyme';
import Fetch from '../Fetch';
import assert from 'assert';
import Button from 'react-bootstrap/lib/Button';
import sinon from 'sinon';
import configureStore from 'redux-mock-store'; // ES6 modules
import { Provider } from 'react-redux';
import 'babel-polyfill';
import 'url-search-params-polyfill';

const linesArr = [
  {lineNumber: 1, text: '[cpp_integration_test:connection_pool_asio_integration_test] 2018-05-09T17:20:31.322+0000 Starting C++ integration test build'},
  {lineNumber: 2, text: 'build/integration_tests/connection_pool_asio_integration_test --connectionString=rs/localhost:20250,localhost:20251'},
  {lineNumber: 3, text: '[cpp_integration_test:connection_pool_asio_integra…pool_asio_integration_test started with pid 9843.'},
  {lineNumber: 4, text: '[cpp_integration_test:connection_pool_asio_integra…ction string = rs/localhost:20250,localhost:20251'},
  {lineNumber: 5, text: '[cpp_integration_test:connection_pool_asio_integra…0 I -        [main] 	 going to run test: TestPing'},
  {lineNumber: 6, text: '[cpp_integration_test:connection_pool_asio_integra…orkInterfaceASIO-0] Connecting to localhost:20250'},
  {lineNumber: 7, text: '[cpp_integration_test:connection_pool_asio_integra…orkInterfaceASIO-0] Connecting to localhost:20250'},
  {lineNumber: 8, text: '[cpp_integration_test:connection_pool_asio_integra…orkInterfaceASIO-0] Connecting to localhost:20250'},
  {lineNumber: 9, text: '[cpp_integration_test:connection_pool_asio_integra…orkInterfaceASIO-0] Connecting to localhost:20250]'},
  {lineNumber: 10, text: '[cpp_integration_test:connection_pool_asio_integra…orkInterfaceASIO-0] Connecting to localhost:20250'}
];
const middlewares = [];
const mockStore = configureStore(middlewares);

let externalFindIndex = -1;

const updateFind = () => {
  console.log('here');
  externalFindIndex = externalFindIndex + 1;
};

const store = mockStore({
  log: {lines: linesArr, colorMap: {}},
  settings: {caseSensitive: false, wrap: false, filterIntersection: false},
  find: {findIdx: -1, searchRegex: ''},
  filters: [],
  highlights: [],
  bookmarks: []
});

const providerWrapper = Enzyme.mount(
  <Provider store={store}>
    <Fetch
      location={{
        pathname: '/lobster/build/4191390ec6c7ee9bdea4e45f9cc94d31/test/5af32dbbf84ae86d1e01e964',
        search: '?bookmarks=0%2C10',
        hash: '',
        state: undefined,
        key: 'dyozxy'}
      }
      match={{
        path: '/lobster/build/:build/test/:test',
        url: '/lobster/build/4191390ec6c7ee9bdea4e45f9cc94d31/test/5af32dbbf84ae86d1e01e964',
        isExact: true,
        params: {build: '4191390ec6c7ee9bdea4e45f9cc94d31', test: '5af32dbbf84ae86d1e01e964'}
      }}
      loadData={sinon.fake()}
      lobsterLoadData={sinon.fake()}
      loadBookmarks={sinon.fake.returns([])}
      loadInitialFilters={sinon.fake.returns([])}
      loadInitialHighlights={sinon.fake.returns([])}
      changeFind={updateFind}
    />
  </Provider>
);

test('Fetch-Search', function() {
  const wrapper = providerWrapper.find('Fetch');
  assert.equal(wrapper.instance().props.findIdx, -1);
  assert.equal(wrapper.instance().state.findResults.length, 0);
  assert.equal(wrapper.instance().props.searchRegex, '');
  assert.equal(wrapper.instance().state.detailsOpen, false);
  assert.ok(!wrapper.containsAllMatchingElements([
    <Button>Next</Button>,
    <Button>Prev</Button>
  ]));
  const toolbarWrapper = wrapper.find('Toolbar');

  // Testing change in search bar with results
  assert.equal(externalFindIndex, -1);
  toolbarWrapper.find('#findInput').instance().value = '2018';
  toolbarWrapper.find('#findInput').simulate('change', {});
  assert.equal(externalFindIndex, 0);
  assert.equal(wrapper.instance().state.findResults.length, 1);
  assert.equal(wrapper.instance().props.searchRegex, '2018');
  assert.equal(wrapper.instance().props.settings.wrap, false);
  assert.equal(wrapper.instance().props.settings.caseSensitive, false);
  assert.equal(wrapper.instance().props.settings.filterIntersection, false);
  /*
  assert.ok(wrapper.containsAllMatchingElements([
    <Button>Next</Button>,
    <Button>Prev</Button>
  ]));
  */

  // Testing change in search bar with no results
  wrapper.find('#findInput').instance().value = '2019';
  wrapper.find('#findInput').at(0).simulate('change', {});
  assert.equal(wrapper.instance().props.findIdx, -1);
  assert.equal(wrapper.instance().state.findResults.length, 0);
  assert.equal(wrapper.instance().props.searchRegex, '2019');
  assert.equal(wrapper.instance().props.settings.wrap, false);
  assert.equal(wrapper.instance().props.settings.caseSensitive, false);
  assert.equal(wrapper.instance().state.detailsOpen, false);
  /*
  assert.ok(!wrapper.containsAllMatchingElements([
    <Button>Next</Button>,
    <Button>Prev</Button>
  ]));
  assert.equal(wrapper.find('.not-found').exists(), true);
  */

  wrapper.find('#findInput').instance().value = 'ASIO';
  wrapper.find('#findInput').at(0).simulate('change', {});
  wrapper.instance().props.settings.caseSensitive = true;

  assert.equal(wrapper.instance().props.findIdx, 0);
  assert.equal(wrapper.instance().state.findResults.length, 10);
  assert.equal(wrapper.instance().props.searchRegex, 'ASIO');
  assert.equal(wrapper.instance().props.settings.wrap, false);
  assert.equal(wrapper.instance().props.settings.caseSensitive, true);
  assert.equal(wrapper.instance().state.detailsOpen, false);
  /*
  assert.ok(wrapper.containsAllMatchingElements([
    <Button>Next</Button>,
    <Button>Prev</Button>
  ]));
  */
});
