import React from 'react';
import Enzyme from 'enzyme';
import LogLineText from './LogLineText';

describe('EvergreenLogViewer', () => {
  const simpleJson = '{"std_get_0_envDataEntry":"distmod","std_get_1_envDataEntry":"rhel62"}';
  test('pretty-print-test', () => {
    const wrapper = Enzyme.shallow(
      <LogLineText
        lineRefCallback={jest.fn()}
        text={''}
        lineNumber={1}
        handleDoubleClick={jest.fn()}
        port={null}
        colorMap={null}
        searchTerm={''}
        startRange={0}
        endRange={2}
        caseSensitive={false}
        highlightText={[]}
        prettyPrint={true}
      />);

      const simpleJsonActual = wrapper.instance().findJSONObjectsInLine(simpleJson);
      const simpleJsonExpected = [JSON.stringify(JSON.parse(simpleJson), null, 2).replace(/"([^"]+)":/g, '$1:')];

      expect(simpleJsonActual).toEqual(simpleJsonExpected);
  });
});
