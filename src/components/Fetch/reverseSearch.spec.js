import React from 'react';
import assert from 'assert';
import {makeWrapper} from './search.spec';
import Button from 'react-bootstrap/lib/Button';

test('Reverse Search', function() {
  const wrapper = makeWrapper();
  // Testing default state
  assert.equal(wrapper.state('findIdx'), -1);
  assert.equal(wrapper.state('findResults').length, 0);
  assert.equal(wrapper.state('find'), '');
  assert.equal(wrapper.state('wrap'), false);
  assert.equal(wrapper.state('caseSensitive'), false);
  assert.equal(wrapper.state('detailsOpen'), false);
  assert.ok(!wrapper.containsAllMatchingElements([
    <Button>Next</Button>,
    <Button>Prev</Button>
  ]));

  // Testing and simulating shift-enter command
  wrapper.find('#findInput').instance().value = 'asio';
  wrapper.simulate('keyUp', {shiftKey: true, keyCode: 13});
  // wrapper.find('#findInput').simulate('change', {});
  assert.equal(wrapper.state('findIdx'), 9);
  assert.equal(wrapper.state('findResults').length, 10);
  assert.equal(wrapper.state('find'), 'asio');
  assert.equal(wrapper.state('wrap'), false);
  assert.equal(wrapper.state('caseSensitive'), false);
  assert.equal(wrapper.state('detailsOpen'), false);
  assert.ok(wrapper.containsAllMatchingElements([
    <Button>Next</Button>,
    <Button>Prev</Button>
  ]));
});
