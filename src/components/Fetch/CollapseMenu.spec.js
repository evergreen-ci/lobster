import React from 'react';
import Enzyme from 'enzyme';
import { CollapseMenu } from './CollapseMenu';
import { ToggleButtonGroup, ToggleButton } from 'react-bootstrap';
import assert from 'assert';
import Button from 'react-bootstrap/lib/Button';
import sinon from 'sinon';

function makeWrapper(id) {
return Enzyme.mount(
  <CollapseMenu
    settings={{ caseSensitive: false, wrap: false, filterIntersection: false }}
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
    logIdentity={id}
  />
);
}

describe('CollapseMenu', () => {
  test('logkeeper-build-notest', function() {
    const logIdentity = {
      type: 'logkeeper',
      build: '4191390ec6c7ee9bdea4e45f9cc94d31'
    };
    const wrapper = makeWrapper(logIdentity);
    const rawUrl = '/build/' + wrapper.prop('build') + '/all?raw=1';
    const HTMLUrl = '/build/' + wrapper.prop('build') + '/all?html=1';
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
    assert(!wrapper.prop('toggleSettings').toggleWrap.called);
    assert(!wrapper.prop('toggleSettings').toggleCaseSensitive.called);
    assert(!wrapper.prop('toggleSettings').toggleFilterIntersection.called);
  });

  test('logkeeper-build-test', function() {
    const logIdentity = {
      type: 'logkeeper',
      build: '4191390ec6c7ee9bdea4e45f9cc94d31',
      test: '12345'
    };
    const wrapper = makeWrapper(logIdentity);
    const rawUrl = '/build/' + wrapper.prop('build') + '/test/12345?raw=1';
    const HTMLUrl = '/build/' + wrapper.prop('build') + '/test/12345?html=1';
    assert.ok(wrapper.containsAllMatchingElements([
      <Button href={rawUrl}>Raw</Button>,
      <Button href={HTMLUrl}>HTML</Button>
    ]));
  });

  test('evergreen-task', function() {
    const logIdentity = {
      type: 'evergreen-task',
      id: 'task-1234',
      execution: 12345,
      log: 'all'
    };
    const wrapper = makeWrapper(logIdentity);
    const taskURL = 'http://evergreen.invalid/task/task-1234/12345';
    const rawURL = 'http://evergreen.invalid/task_log_raw/task-1234/12345?type=ALL&text=true';
    const HTMLURL = 'http://evergreen.invalid/task_log_raw/task-1234/12345?type=ALL';
    assert.ok(wrapper.containsAllMatchingElements([
      <Button href={taskURL}>Task</Button>,
      <Button href={rawURL}>Raw</Button>,
      <Button href={HTMLURL}>HTML</Button>
    ]));
  });
});
