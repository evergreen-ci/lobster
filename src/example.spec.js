import assert from 'assert';
import Adapter from 'enzyme-adapter-react-15';
import React from 'react';
import Enzyme from 'enzyme';
import LineNumber from '../src/components/LogView'

Enzyme.configure({ adapter: new Adapter() });

class Test extends React.Component {
  constructor(props){
    super(props);
    this.state = {
        test: true
    };
  }

  render() {
      if (this.state) {
          return <span>test</span>;

      }else {
          return <span>not test</span>;
      }
  }
}

test('<Test/>', function() {
  const wrapper = Enzyme.mount(<Test/>);
  assert.equal(wrapper.state('test'), true);
});
