// @flow

import React from 'react';
import Enzyme from 'enzyme';
import Button from 'react-bootstrap/lib/Button';
import { Toolbar } from './Toolbar';
import { Col, ControlLabel } from 'react-bootstrap';

const linesArr = [
  { lineNumber: 1, text: '[cpp_integration_test:connection_pool_asio_integration_test] 2018-05-09T17:20:31.322+0000 Starting C++ integration test build', gitRef: null, port: null },
  { lineNumber: 2, text: 'build/integration_tests/connection_pool_asio_integration_test --connectionString=rs/localhost:20250,localhost:20251', gitRef: null, port: null },
  { lineNumber: 3, text: '[cpp_integration_test:connection_pool_asio_integra…pool_asio_integration_test started with pid 9843.', gitRef: null, port: null },
  { lineNumber: 4, text: '[cpp_integration_test:connection_pool_asio_integra…ction string = rs/localhost:20250,localhost:20251', gitRef: null, port: null },
  { lineNumber: 5, text: '[cpp_integration_test:connection_pool_asio_integra…0 I -        [main] 	 going to run test: TestPing', gitRef: null, port: null },
  { lineNumber: 6, text: '[cpp_integration_test:connection_pool_asio_integra…orkInterfaceASIO-0] Connecting to localhost:20250', gitRef: null, port: null },
  { lineNumber: 7, text: '[cpp_integration_test:connection_pool_asio_integra…orkInterfaceASIO-0] Connecting to localhost:20250', gitRef: null, port: null },
  { lineNumber: 8, text: '[cpp_integration_test:connection_pool_asio_integra…orkInterfaceASIO-0] Connecting to localhost:20250', gitRef: null, port: null },
  { lineNumber: 9, text: '[cpp_integration_test:connection_pool_asio_integra…orkInterfaceASIO-0] Connecting to localhost:20250]', gitRef: null, port: null },
  { lineNumber: 10, text: '[cpp_integration_test:connection_pool_asio_integra…orkInterfaceASIO-0] Connecting to localhost:20250', gitRef: null, port: null }
];

function makeWrapper(state) {
  return Enzyme.shallow(
    <Toolbar
      log={{
        lines: linesArr,
        colorMap: {}
      }}
      settings={{
        caseSensitive: false,
        wrap: false,
        filterIntersection: false,
        expandableRows: true,
      }}
      filterList={[]}
      highlightList={[]}
      bookmarks={[]}
      searchRegex={''}
      findIdx={-1}
      handleChangeFindEvent={jest.fn()}
      addFilter={jest.fn()}
      filterActions={{
        removeFilter: jest.fn(),
        toggleFilter: jest.fn(),
        toggleFilterInverse: jest.fn()
      }}
      addHighlight={jest.fn()}
      highlightActions={{
        removeHighlight: jest.fn(),
        toggleHighlight: jest.fn(),
        toggleHighlightLine: jest.fn()
      }}
      togglePanel={jest.fn()}
      detailsOpen={false}
      handleSubmit={jest.fn()}
      server={null}
      url={null}
      build={'4191390ec6c7ee9bdea4e45f9cc94d31'}
      setURLRef={jest.fn()}
      valueJIRA={'asdfghjkl'}
      findResults={state}
      changeFindIdx={jest.fn()}
      changeSearch={jest.fn()}
      nextFind={jest.fn()}
      prevFind={jest.fn()}
      find={jest.fn()}
      searchTerm={''}
      searchTermError={null}
      setFormRef={jest.fn()}
      setSearch={jest.fn()}
      wipeCache={jest.fn()}
    />
  );
}

test('Toolbar-Search', function() {
  const wrapper = makeWrapper([]);
  expect(wrapper.containsAllMatchingElements([
    <Button onClick={wrapper.instance().props.nextFind}>Next</Button>,
    <Button onClick={wrapper.instance().props.prevFind}>Prev</Button>
  ])).toBe(false);

  // Testing change in search bar with results

  // Manually change find results to see if next/prev buttons render
  wrapper.setProps({ findResults: [0], searchTerm: '2018', findIdx: 0 });
  expect(wrapper.containsAllMatchingElements([
    <Col lg={1} componentClass={ControlLabel} className="next-prev" >1/1</Col>,
    <Button>Next</Button>,
    <Button>Prev</Button>
  ])).toBe(true);

  wrapper.setProps({ findResults: [], searchTerm: '2018' });
  expect(wrapper.containsAllMatchingElements([
    <Col lg={1} componentClass={ControlLabel} className="not-found" >Not Found</Col>
  ])).toBe(true);
});
