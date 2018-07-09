import React from 'react';
import assert from 'assert';
import {makeWrapper} from './search.spec';
import Button from 'react-bootstrap/lib/Button';

test('Reverse Search', function() {
  const wrapper = makeWrapper();

  // Testing basic shift+enter search
  wrapper.find('#findInput').instance().value = 'asio';
  wrapper.find('#findInput').simulate('change', {});
  const shiftEnterEvent = new Event('keydown', {'bubbles': true, 'cancelable': true});
  shiftEnterEvent.keyCode = 13;
  shiftEnterEvent.shiftKey = true;
  wrapper.instance().findInput.dispatchEvent(shiftEnterEvent);
  assert.equal(wrapper.instance().props.findIdx, 9);
  assert.equal(wrapper.instance().state.findResults.length, 10);
  assert.equal(wrapper.instance().props.searchRegex, 'asio');
  assert.equal(wrapper.instance().props.settings.wrap, false);
  assert.equal(wrapper.instance().props.settings.caseSensitive, false);
  assert.equal(wrapper.instance().state.detailsOpen, false);

  // Testing shift+enter and enter combinations
  wrapper.instance().findInput.dispatchEvent(shiftEnterEvent);
  assert.equal(wrapper.instance().props.findIdx, 8);
  wrapper.instance().findInput.dispatchEvent(shiftEnterEvent);
  assert.equal(wrapper.instance().props.findIdx, 7);
  wrapper.find('#formSubmit').at(0).simulate('click', {});
  assert.equal(wrapper.instance().props.findIdx, 8);
  wrapper.instance().findInput.dispatchEvent(shiftEnterEvent);
  assert.equal(wrapper.instance().props.findIdx, 7);

  // Testing shift+enter with no results
  wrapper.find('#findInput').instance().value = '34';
  wrapper.find('#findInput').simulate('change', {});
  wrapper.instance().findInput.dispatchEvent(shiftEnterEvent);
  assert.equal(wrapper.instance().props.findIdx, -1);
  assert.equal(wrapper.instance().state.findResults.length, 0);
  assert.equal(wrapper.instance().props.searchRegex, '34');
  assert.ok(!wrapper.containsAllMatchingElements([
    <Button>Next</Button>,
    <Button>Prev</Button>
  ]));
});
