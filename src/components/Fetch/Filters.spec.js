import assert from 'assert';
import Enzyme from 'enzyme';
import { Filters, Filter } from './Filters';
import React from 'react';

test('Filters', function() {
  let data = [
    {
      text: 'Hello',
      on: true,
      inverse: false,
      highlight: false
    },
    {
      text: 'Goodbye',
      on: true,
      inverse: false,
      highlight: false
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
  const toggleFilterHighlight = (text) => {
    const d = data.find(elem => text === elem.text);
    d.highlight = !d.highlight;
  };

  const wrapper = Enzyme.mount(
    <Filters
      filters={data}
      removeFilter={removeFilter}
      toggleFilter={toggleFilter}
      toggleFilterInverse={toggleFilterInverse}
      toggleFilterHighlight={toggleFilterHighlight}
    />);

  assert.ok(wrapper.containsAllMatchingElements([
    <Filter
      filter={data[0]}
      removeFilter={removeFilter}
      toggleFilter={toggleFilter}
      toggleFilterInverse={toggleFilterInverse}
      toggleFilterHighlight={toggleFilterHighlight}
    />,
    <Filter
      filter={data[1]}
      removeFilter={removeFilter}
      toggleFilter={toggleFilter}
      toggleFilterInverse={toggleFilterInverse}
      toggleFilterHighlight={toggleFilterHighlight}
    />
  ]
  ));

  const buttons = wrapper.find('Button');
  assert.equal(buttons.length, 8);
  buttons.at(0).simulate('click', {});
  assert.equal(data.length, 1);
  wrapper.setProps({filters: data});
  assert.equal(wrapper.find('Button').length, 4);
});

test('Filter', function() {
  let data = {
    text: 'Hello',
    on: true,
    inverse: false,
    highlight: false
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
  const toggleFilterHighlight = () => {
    data.highlight = !data.highlight;
  };

  const wrapper = Enzyme.mount(
    <Filter
      filter={data}
      removeFilter={removeFilter}
      toggleFilter={toggleFilter}
      toggleFilterInverse={toggleFilterInverse}
      toggleFilterHighlight={toggleFilterHighlight}
    />);

  assert.ok(wrapper.containsAllMatchingElements([
    <span>Hello</span>
  ]));

  const buttons = wrapper.find('Button');
  assert.equal(buttons.length, 4);
  buttons.map(function(e, index) {
    data = {
      text: 'Hello',
      on: true,
      inverse: false,
      highlight: false
    };
    e.simulate('click', {});

    if (index === 0) {
      assert.ok(data === null);
    } else if (index === 1) {
      assert.ok(data.on === false);
      e.simulate('click', {});
      assert.ok(data.on === true);
    } else if (index === 2) {
      assert.ok(data.highlight === true);
      e.simulate('click', {});
      assert.ok(data.highlight === false);
    } else if (index === 3) {
      assert.ok(data.inverse === true);
      e.simulate('click', {});
      assert.ok(data.inverse === false);
    } else {
      throw new Error('bad index');
    }
  });
});
