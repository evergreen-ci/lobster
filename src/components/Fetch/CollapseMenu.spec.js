import React from 'react';
import Enzyme from 'enzyme';
import { CollapseMenu } from './CollapseMenu';
import assert from 'assert';
import Button from 'react-bootstrap/lib/Button';
import sinon from 'sinon';

const wrapper = Enzyme.mount(
  <CollapseMenu
    settings={{caseSensitive: false, wrap: false, filterIntersection: false}}
    filterActions={{
      removeFilter: sinon.fake(),
      toggleFilter: sinon.fake(),
      toggleFilterInverse: sinon.fake()
    }}
    highlightActions={{
      removeHighlight: sinon.fake(),
      toggleHighlight: sinon.fake(),
      toggleHighlightLine: sinon.fake()
    }}
    toggleWrap={sinon.fake()}
    toggleCaseSensitive={sinon.fake()}
    toggleFilterIntersection={sinon.fake()}
    filterList={[]}
    highlightList={[]}
    server={null}
    url={null}
    detailsOpen={true}
    handleSubmit={sinon.fake()}
    build={'4191390ec6c7ee9bdea4e45f9cc94d31'}
    setURLRef={sinon.fake()}
    valueJIRA={'{noformat}↵[cpp_integration_test:connection_pool_asio_integration_test] 2018-05-09T17:20:31.322+0000 Starting C++ integration test build/integration_tests/connection_pool_asio_integration_test...↵...↵↵{noformat}'}
  />
);

test('CollapseMenu', function() {
  const wrap = wrapper.find('FormGroup');
  console.log(wrap);
  const rawUrl = '/build/' + wrapper.state('build') + '/all?raw=1';
  const HTMLUrl = '/build/' + wrapper.state('build') + '/all?html=1';
  const buttons = wrap.find('Button');
  console.log(buttons.length);
  assert.ok(wrap.containsAllMatchingElements([
    <Button href={rawUrl}>Raw</Button>,
    <Button href={HTMLUrl}>HTML</Button>
  ]));
});
