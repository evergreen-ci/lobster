import React from 'react';
import Enzyme from 'enzyme';
import LogView from '../LogView';
import assert from 'assert';
import {makeWrapper} from '../Fetch/search.spec';

test('Select', function() {
  global.window.innerHeight = 1500;
  const wrapper = makeWrapper();
  wrapper.update();
  assert.equal(wrapper.state('bookmarks').length, 2);
  // Testing single line bookmarks
  const logView = wrapper.find('LogView');
  logView.instance().scrollToLine(10);
  console.log(logView.instance().state.lineMap);
  const line1 = logView.instance().state.lineMap[1];
});
