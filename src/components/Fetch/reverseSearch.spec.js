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

  // Testing basic shift+enter search
  wrapper.find('#findInput').instance().value = 'asio';
  wrapper.find('#findInput').simulate('change', {});
  const shiftEnterEvent = new Event('keydown', {'bubbles': true, 'cancelable': true});
  shiftEnterEvent.keyCode = 13;
  shiftEnterEvent.shiftKey = true;
  wrapper.instance().findInput.dispatchEvent(shiftEnterEvent);
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

  // Testing shift+enter and enter combinations
  wrapper.instance().findInput.dispatchEvent(shiftEnterEvent);
  assert.equal(wrapper.state('findIdx'), 8);
  wrapper.instance().findInput.dispatchEvent(shiftEnterEvent);
  assert.equal(wrapper.state('findIdx'), 7);
  wrapper.find('#formSubmit').at(0).simulate('click', {});
  assert.equal(wrapper.state('findIdx'), 8);
  wrapper.instance().findInput.dispatchEvent(shiftEnterEvent);
  assert.equal(wrapper.state('findIdx'), 7);

  // Testing shift+enter with no results
  wrapper.find('#findInput').instance().value = '34';
  wrapper.find('#findInput').simulate('change', {});
  wrapper.instance().findInput.dispatchEvent(shiftEnterEvent);
  assert.equal(wrapper.state('findIdx'), -1);
  assert.equal(wrapper.state('findResults').length, 0);
  assert.equal(wrapper.state('find'), '34');
  assert.ok(!wrapper.containsAllMatchingElements([
    <Button>Next</Button>,
    <Button>Prev</Button>
  ]));
});
