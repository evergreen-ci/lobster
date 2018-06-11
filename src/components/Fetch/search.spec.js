import React from 'react';
import Enzyme from 'enzyme';
import Fetch from '../Fetch';
import assert from 'assert';
import Button from 'react-bootstrap/lib/Button';


test('Fetch-Search', function() {
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

  const wrapper = Enzyme.mount(
    <Fetch
      lines={linesArr}
      location={{
        pathname: '/lobster/build/4191390ec6c7ee9bdea4e45f9cc94d31/test/5af32dbbf84ae86d1e01e964',
        search: '?bookmarks=0%2C1129',
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
      colorMap={{}}
    />, {
      attachTo: document.body
    });

  // Testing default state, no entry for searchbar
  assert.equal(wrapper.state('findIdx'), -1);
  assert.equal(wrapper.state('findResults').length, 0);
  assert.equal(wrapper.state('find'), '');
  assert.equal(wrapper.state('wrap'), false);
  assert.equal(wrapper.state('caseSensitive'), false);
  assert.equal(wrapper.state('detailsOpen'), false);
  // console.log(wrapper.render());
  assert.equal(wrapper.containsAllMatchingElements([
    <Button>Next</Button>,
    <Button>Prev</Button>
  ]), false);

  // Testing change in search bar with results
  wrapper.find('#findInput').instance().value = '2018';
  wrapper.find('#findInput').at(0).simulate('change');
  assert.equal(wrapper.state('findIdx'), 0);
  assert.equal(wrapper.state('findResults').length, 1);
  assert.equal(wrapper.state('find'), '2018');
  assert.equal(wrapper.state('wrap'), false);
  assert.equal(wrapper.state('caseSensitive'), false);
  assert.equal(wrapper.state('detailsOpen'), false);
  assert.equal(wrapper.containsAllMatchingElements([
    <Button>Next</Button>,
    <Button>Prev</Button>
  ]), true);

  // Testing change in search bar with no results
  wrapper.find('#findInput').instance().value = '2019';
  wrapper.find('#findInput').at(0).simulate('change');
  assert.equal(wrapper.state('findIdx'), -1);
  assert.equal(wrapper.state('findResults').length, 0);
  assert.equal(wrapper.state('find'), '2019');
  assert.equal(wrapper.state('wrap'), false);
  assert.equal(wrapper.state('caseSensitive'), false);
  assert.equal(wrapper.state('detailsOpen'), false);
  assert.equal(wrapper.containsAllMatchingElements([
    <Button>Next</Button>,
    <Button>Prev</Button>
  ]), false);
  assert.equal(wrapper.find('.not-found').exists(), true);

  wrapper.find('#findInput').instance().value = 'ASIO';
  wrapper.find('#findInput').at(0).simulate('change');
  wrapper.instance().state.caseSensitive = true;

  // console.log(wrapper.state('caseSensitive'));
  console.log(wrapper.state('findResults'));
  assert.equal(wrapper.state('findIdx'), 0);
  assert.equal(wrapper.state('findResults').length, 10);
  assert.equal(wrapper.state('find'), 'ASIO');
  assert.equal(wrapper.state('wrap'), false);
  assert.equal(wrapper.state('caseSensitive'), true);
  assert.equal(wrapper.state('detailsOpen'), false);
  assert.equal(wrapper.containsAllMatchingElements([
    <Button>Next</Button>,
    <Button>Prev</Button>
  ]), true);
});
