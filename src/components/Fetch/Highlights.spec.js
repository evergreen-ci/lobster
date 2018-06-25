import assert from 'assert';
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

  assert.ok(wrapper.containsAllMatchingElements([
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
  ));

  const buttons = wrapper.find('Button');
  assert.equal(buttons.length, 10);
  buttons.at(0).simulate('click', {});
  assert.equal(data.length, 1);
  wrapper.setProps({highlights: data});
  assert.equal(wrapper.find('Button').length, 5);
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

  assert.ok(wrapper.containsAllMatchingElements([
    <span>Hello</span>
  ]));

  const buttons = wrapper.find('Button');
  assert.equal(buttons.length, 5);
  buttons.map(function(e, index) {
    data = {
      text: 'Hello',
      on: true,
      line: true
    };

    if (index === 0) {
      assert.ok(data !== null);
      e.simulate('click', {});
      assert.ok(data === null);
    }
  });
  assert.ok(data.on === true);
  wrapper.instance().toggleHighlight();
  wrapper.update();
  assert.ok(data.on === false);
  assert.ok(data.line === true);
  wrapper.instance().toggleHighlightLine();
  assert.ok(data.line === false);
});
