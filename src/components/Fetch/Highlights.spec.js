import Enzyme from 'enzyme';
import { Highlights, Highlight } from './Highlights';
import React from 'react';

test('Highlights', function() {
  let data = [
    {
      text: 'Hello',
      on: true,
      line: true
    },
    {
      text: 'Goodbye',
      on: true,
      line: true
    }
  ];

  const removeHighlight = (text) => {
    const index = data.findIndex((elem) => text !== elem);
    data = data.filter((_elem, i) => i !== index);
  };
  const toggleHighlight = (text) => {
    const d = data.find(elem => text === elem.text);
    d.on = !d.on;
  };
  const toggleHighlightLine = (text) => {
    const d = data.find(elem => text === elem.text);
    d.line = !d.line;
  };

  const wrapper = Enzyme.mount(
    <Highlights
      highlights={data}
      removeHighlight={removeHighlight}
      toggleHighlight={toggleHighlight}
      toggleHighlightLine={toggleHighlightLine}
    />);

  expect(wrapper.containsAllMatchingElements([
    <Highlight
      highlight={data[0]}
      removeHighlight={removeHighlight}
      toggleHighlight={toggleHighlight}
      toggleHighlightLine={toggleHighlightLine}
    />,
    <Highlight
      highlight={data[1]}
      removeHighlight={removeHighlight}
      toggleHighlight={toggleHighlight}
      toggleHighlightLine={toggleHighlightLine}
    />
  ]
  )).toBe(true);

  const buttons = wrapper.find('Button');
  expect(buttons).toHaveLength(14);
  buttons.at(0).simulate('click', {});
  expect(data).toHaveLength(1);
  wrapper.setProps({ highlights: data });
  expect(wrapper.find('Button')).toHaveLength(7);
});

test('Highlight', function() {
  let data = {
    text: 'Hello',
    on: true,
    line: true
  };

  const removeHighlight = () => {
    data = null;
  };
  const toggleHighlight = () => {
    data.on = !data.on;
  };
  const toggleHighlightLine = () => {
    data.line = !data.line;
  };

  const wrapper = Enzyme.mount(
    <Highlight
      highlight={data}
      removeHighlight={removeHighlight}
      toggleHighlight={toggleHighlight}
      toggleHighlightLine={toggleHighlightLine}
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
      line: true
    };

    if (index === 0) {
      expect(data).not.toBe(null);
      e.simulate('click', {});
      expect(data).toBe(null);
    }
  });
  expect(data.on).toBe(true);
  wrapper.instance().toggleHighlight();
  wrapper.update();
  expect(data.on).toBe(false);
  expect(data.line).toBe(true);
  wrapper.instance().toggleHighlightLine();
  expect(data.line).toBe(false);
});
