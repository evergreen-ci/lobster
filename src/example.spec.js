import assert from 'assert';
import React from 'react';
import Enzyme from 'enzyme';

class Test extends React.Component { // eslint-disable-line no-unused-vars
  constructor(props) {
    super(props);
    this.state = {
      test: true
    };
  }

  render() {
    if (this.state) {
      return <span>test</span>;
    }

    return <span>not test</span>;
  }
}

test('Test', function() {
  const wrapper = Enzyme.mount(<Test/>);
  assert.equal(wrapper.state('test'), true);
});
