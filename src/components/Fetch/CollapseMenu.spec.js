import React from 'react';
import Enzyme from 'enzyme';
import { CollapseMenu } from './CollapseMenu';
import { ToggleButtonGroup, ToggleButton } from 'react-bootstrap';
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
    toggleSettings={{
      toggleWrap: sinon.fake(),
      toggleCaseSensitive: sinon.fake(),
      toggleFilterIntersection: sinon.fake()
    }}
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
  const rawUrl = '/build/' + wrapper.instance().props.build + '/all?raw=1';
  const HTMLUrl = '/build/' + wrapper.instance().props.build + '/all?html=1';
  assert.ok(wrapper.containsAllMatchingElements([
    <Button href={rawUrl}>Raw</Button>,
    <Button href={HTMLUrl}>HTML</Button>
  ]));

  // Test existence of toggle buttons
  const toggleButtons = wrapper.find('ToggleButtonGroup');
  assert.equal(toggleButtons.length, 3);
  assert.ok(wrapper.containsAllMatchingElements([
    <ToggleButtonGroup name={'wrap-on-off'}>
      <ToggleButton value={true}>on</ToggleButton>
      <ToggleButton value={false}>off</ToggleButton>
    </ToggleButtonGroup>,
    <ToggleButtonGroup name={'case-sensitive-on-off'}>
      <ToggleButton value={true}>on</ToggleButton>
      <ToggleButton value={false}>off</ToggleButton>
    </ToggleButtonGroup>,
    <ToggleButtonGroup name={'filter-intersection-and-or'}>
      <ToggleButton value={true}>and</ToggleButton>
      <ToggleButton value={false}>or</ToggleButton>
    </ToggleButtonGroup>
  ]));

  // Test button toggling
  assert(!wrapper.instance().props.toggleSettings.toggleWrap.called);
  assert(!wrapper.instance().props.toggleSettings.toggleCaseSensitive.called);
  assert(!wrapper.instance().props.toggleSettings.toggleFilterIntersection.called);
});
