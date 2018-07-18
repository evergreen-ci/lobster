import React from 'react';
import assert from 'assert';
import Enzyme from 'enzyme';
import { LogDrop } from './LogDrop';
import sinon from 'sinon';

describe('LogDrop', function() {
  test('default', function() {
    const process = sinon.fake();
    const wrapper = Enzyme.mount(<LogDrop processLog={ process } />);

    assert.strictEqual(wrapper.contains(<select />), false);
  });

  test('drop', function() {
    const process = sinon.fake();
    const history = sinon.fake();
    const wrapper = Enzyme.mount(<LogDrop processLog={ process } history={history} />);

    const f = new File(['line0\nline1\n'], 'log.log');
    wrapper.instance().drop({
      preventDefault: sinon.fake(),
      type: 'drop',
      dataTransfer: {
        files: [f]
      }
    });

    assert.strictEqual(wrapper.state('files').length, 1);
    assert.strictEqual(wrapper.state('files')[0], f);
    assert.strictEqual(wrapper.state('processing'), false);
    assert.strictEqual(wrapper.state('error'), null);
    assert.strictEqual(process.callCount, 0);

    wrapper.instance().upload();
    assert.strictEqual(wrapper.state('files').length, 1);
    assert.strictEqual(wrapper.state('files')[0], f);
    assert.strictEqual(wrapper.state('processing'), true);
    assert.strictEqual(wrapper.state('error'), null);
  });
});
