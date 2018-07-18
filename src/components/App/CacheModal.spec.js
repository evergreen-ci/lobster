import React from 'react';
import Enzyme from 'enzyme';
import { CacheModal } from './CacheModal';
import sinon from 'sinon';
import assert from 'assert';

describe('CacheModal', function() {
  test('show', function() {
    const fakes = {
      save: sinon.fake(),
      never: sinon.fake(),
      later: sinon.fake()
    };
    const wrapper = Enzyme.mount(
      <CacheModal
        show={true}
        {...fakes}
      />);

    assert.strictEqual(wrapper.contains(<label>{wrapper.state('value')} MiB</label>), true);

    let count = 0;
    for (let i = 0; i < 3; ++i) {
      const button = wrapper.find('Button').at(i);
      const txt = button.prop('children');
      if (txt === 'Never') {
        button.simulate('click', {});
        assert.strictEqual(fakes.never.callCount, 1);
        count += 1;
      }
      if (txt === 'Yes') {
        button.simulate('click', {});
        assert.strictEqual(fakes.save.callCount, 1);
        count += 1;
      }
      if (txt === 'Not Now') {
        button.simulate('click', {});
        assert.strictEqual(fakes.later.callCount, 1);
        count += 1;
      }
    }
    assert.strictEqual(count, 3);
  });
});
