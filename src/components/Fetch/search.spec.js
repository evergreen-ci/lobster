import React from 'react';
import Enzyme from 'enzyme';
import Fetch from '../Fetch';
import assert from 'assert';
import FormControl from 'react-bootstrap/lib/FormControl';


test('Fetch-Search', function() {
  let linesArr = [];
  // Add lines to lines array
  linesArr.push({lineNumber: 1, text: '[cpp_integration_test:connection_pool_asio_integration_test] 2018-05-09T17:20:31.322+0000 Starting C++ integration test build'});
  linesArr.push({lineNumber: 2, text: 'build/integration_tests/connection_pool_asio_integration_test --connectionString=rs/localhost:20250,localhost:20251'});
  linesArr.push({lineNumber: 3, text: '[cpp_integration_test:connection_pool_asio_integra…pool_asio_integration_test started with pid 9843.'});
  linesArr.push({lineNumber: 4, text: '[cpp_integration_test:connection_pool_asio_integra…ction string = rs/localhost:20250,localhost:20251'});
  linesArr.push({lineNumber: 5, text: '[cpp_integration_test:connection_pool_asio_integra…0 I -        [main] 	 going to run test: TestPing'});
  linesArr.push({lineNumber: 6, text: '[cpp_integration_test:connection_pool_asio_integra…orkInterfaceASIO-0] Connecting to localhost:20250'});
  linesArr.push({lineNumber: 7, text: '[cpp_integration_test:connection_pool_asio_integra…orkInterfaceASIO-0] Connecting to localhost:20250'});
  linesArr.push({lineNumber: 8, text: '[cpp_integration_test:connection_pool_asio_integra…orkInterfaceASIO-0] Connecting to localhost:20250'});
  linesArr.push({lineNumber: 9, text: '[cpp_integration_test:connection_pool_asio_integra…orkInterfaceASIO-0] Connecting to localhost:20250]'});
  linesArr.push({lineNumber: 10, text: '[cpp_integration_test:connection_pool_asio_integra…orkInterfaceASIO-0] Connecting to localhost:20250'});

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
    />);
  assert.equal(wrapper.state('findIdx'), -1);
  assert.equal(wrapper.state('findResults').length, 0);
  assert.equal(wrapper.state('find'), '');
  assert.equal(wrapper.state('wrap'), false);
  assert.equal(wrapper.state('caseSensitive'), false);
  assert.equal(wrapper.state('detailsOpen'), false);

  // wrapper.find(FormControl).first().prop('onChange')({ value: '4' });
  wrapper.find('#findInput').instance().value = '2018';
  wrapper.find('#findInput').at(0).simulate('change');
  // wrapper.instance().find(false);
  // wrapper.update();
  // assert.equal(wrapper.state('findResults').length, 430);
  assert.equal(wrapper.state('findIdx'), 0);
});
