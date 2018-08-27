import Enzyme from 'enzyme';
import { Filters, Filter } from './Filters';
import React from 'react';

test('Filters', function() {
  let data = [
    {
      text: 'Hello',
      on: true,
      inverse: false
    },
    {
      text: 'Goodbye',
      on: true,
      inverse: false
    }
  ];

  const removeFilter = (text) => {
    const index = data.findIndex((elem) => text !== elem);
    data = data.filter((_elem, i) => i !== index);
  };
  const toggleFilter = (text) => {
    const d = data.find(elem => text === elem.text);
    d.on = !d.on;
  };
  const toggleFilterInverse = (text) => {
    const d = data.find(elem => text === elem.text);
    d.inverse = !d.inverse;
  };

  const wrapper = Enzyme.mount(
    <Filters
      filters={data}
      removeFilter={removeFilter}
      toggleFilter={toggleFilter}
      toggleFilterInverse={toggleFilterInverse}
    />);

  expect(wrapper.containsAllMatchingElements([
    <Filter
      filter={data[0]}
      removeFilter={removeFilter}
      toggleFilter={toggleFilter}
      toggleFilterInverse={toggleFilterInverse}
    />,
    <Filter
      filter={data[1]}
      removeFilter={removeFilter}
      toggleFilter={toggleFilter}
      toggleFilterInverse={toggleFilterInverse}
    />
  ]
  )).toBe(true);

  const buttons = wrapper.find('Button');
  expect(buttons).toHaveLength(14);
  buttons.at(0).simulate('click', {});
  expect(data).toHaveLength(1);
  wrapper.setProps({ filters: data });
  expect(wrapper.find('Button')).toHaveLength(7);
});

test('Filter', function() {
  let data = {
    text: 'Hello',
    on: true,
    inverse: false
  };

  const removeFilter = () => {
    data = null;
  };
  const toggleFilter = () => {
    data.on = !data.on;
  };
  const toggleFilterInverse = () => {
    data.inverse = !data.inverse;
  };

  const wrapper = Enzyme.mount(
    <Filter
      filter={data}
      removeFilter={removeFilter}
      toggleFilter={toggleFilter}
      toggleFilterInverse={toggleFilterInverse}
    />);

  expect(wrapper.containsAllMatchingElements([
    <span>Hello</span>
  ])).toBe(true);

  const buttons = wrapper.find('Button');
  expect(buttons).toHaveLength(7);
  buttons.map(function(e, index) {
    data = {
      text: 'Hello',
      on: true,
      inverse: false
    };

    if (index === 0) {
      expect(data).not.toBe(null);
      e.simulate('click', {});
      expect(data).toBe(null);
    }
  });
  expect(data.on).toBe(true);
  wrapper.instance().toggleFilter();
  wrapper.update();
  expect(data.on).toBe(false);
  expect(data.inverse).toBe(false);
  wrapper.instance().toggleFilterInverse();
  expect(data.inverse).toBe(true);
});
