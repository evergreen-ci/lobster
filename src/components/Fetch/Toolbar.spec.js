import React from 'react';
import Enzyme from 'enzyme';
import assert from 'assert';
import Button from 'react-bootstrap/lib/Button';
import sinon from 'sinon';
import { Toolbar } from './Toolbar';
import 'babel-polyfill';
import 'url-search-params-polyfill';

const linesArr = [
  { lineNumber: 1, text: '[cpp_integration_test:connection_pool_asio_integration_test] 2018-05-09T17:20:31.322+0000 Starting C++ integration test build' },
  { lineNumber: 2, text: 'build/integration_tests/connection_pool_asio_integration_test --connectionString=rs/localhost:20250,localhost:20251' },
  { lineNumber: 3, text: '[cpp_integration_test:connection_pool_asio_integra…pool_asio_integration_test started with pid 9843.' },
  { lineNumber: 4, text: '[cpp_integration_test:connection_pool_asio_integra…ction string = rs/localhost:20250,localhost:20251' },
  { lineNumber: 5, text: '[cpp_integration_test:connection_pool_asio_integra…0 I -        [main] 	 going to run test: TestPing' },
  { lineNumber: 6, text: '[cpp_integration_test:connection_pool_asio_integra…orkInterfaceASIO-0] Connecting to localhost:20250' },
  { lineNumber: 7, text: '[cpp_integration_test:connection_pool_asio_integra…orkInterfaceASIO-0] Connecting to localhost:20250' },
  { lineNumber: 8, text: '[cpp_integration_test:connection_pool_asio_integra…orkInterfaceASIO-0] Connecting to localhost:20250' },
  { lineNumber: 9, text: '[cpp_integration_test:connection_pool_asio_integra…orkInterfaceASIO-0] Connecting to localhost:20250]' },
  { lineNumber: 10, text: '[cpp_integration_test:connection_pool_asio_integra…orkInterfaceASIO-0] Connecting to localhost:20250' }
];

const wrapper = Enzyme.shallow(
  <Toolbar
    log={{
      lines: linesArr,
      colorMap: {}
    }}
    settings={{
      caseSensitive: false,
      wrap: false,
      filterIntersection: false
    }}
    filterList={[]}
    highlightList={[]}
    bookmarks={[]}
    searchRegex={''}
    findIdx={-1}
    setFormRef={sinon.fake()}
    toggleSettings={{
      toggleWrap: sinon.fake(),
      toggleCaseSensitive: sinon.fake(),
      toggleFilterIntersection: sinon.fake()
    }}
    handleChangeFindEvent={sinon.fake()}
    addFilter={sinon.fake()}
    filterActions={{
      removeFilter: sinon.fake(),
      toggleFilter: sinon.fake(),
      toggleFilterInverse: sinon.fake()
    }}
    addHighlight={sinon.fake()}
    highlightActions={{
      removeHighlight: sinon.fake(),
      toggleHighlight: sinon.fake(),
      toggleHighlightLine: sinon.fake()
    }}
    togglePanel={sinon.fake()}
    detailsOpen={false}
    handleSubmit={sinon.fake()}
    server={null}
    url={null}
    build={'4191390ec6c7ee9bdea4e45f9cc94d31'}
    setURLRef={sinon.fake()}
    valueJIRA={'asdfghjkl'}
    findResults={[]}
    changeFindIdx={sinon.fake()}
    changeSearch={sinon.fake()}
    nextFind={sinon.fake()}
    prevFind={sinon.fake()}
    find={sinon.fake()}
  />
);

test('Toolbar-Search', function() {
  assert.equal(wrapper.instance().props.findIdx, -1);
  assert.equal(wrapper.instance().props.findResults.length, 0);
  assert.equal(wrapper.instance().props.searchRegex, '');
  assert(!wrapper.instance().props.handleChangeFindEvent.called);
  assert(!wrapper.instance().props.find.called);
  assert.ok(!wrapper.containsAllMatchingElements([
    <Button onClick={wrapper.instance().props.nextFind}>Next</Button>,
    <Button onClick={wrapper.instance().props.prevFind}>Prev</Button>
  ]));

  // Testing change in search bar with results
  // wrapper.find('#findInput').instance().value = '2018';
  // wrapper.find('#findInput').simulate('change', {});
  // assert(wrapper.instance().props.handleChangeFindEvent.called);

  // // Manually change find results to see if next/prev buttons render
  // wrapper.setProps({ findResults: [1, 2, 3], searchRegex: '2018' });
  // assert.equal(wrapper.instance().props.findResults.length, 3);
  // assert.ok(wrapper.containsAllMatchingElements([
  //   <Button>Next</Button>,
  //   <Button>Prev</Button>
  // ]));

  // // Test next and prev button clicks
  // assert(!wrapper.instance().props.nextFind.called);
  // assert(!wrapper.instance().props.prevFind.called);
  // const buttons = wrapper.find(Button);
  // buttons.at(1).simulate('click', {});
  // assert(wrapper.instance().props.nextFind.called);
  // buttons.at(2).simulate('click', {});
  // assert(wrapper.instance().props.prevFind.called);
});
