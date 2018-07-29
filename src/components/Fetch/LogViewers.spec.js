import React from 'react';
import Enzyme from 'enzyme';
import LogkeeperLogViewer from './LogkeeperLogViewer';
import EvergreenLogViewer from './EvergreenLogViewer';

describe('EvergreenLogViewer', () => {
  test('test-with-line', () => {
    const wrapper = Enzyme.shallow(
      <EvergreenLogViewer
        location={{
          hash: '#L1234&bookmarks=12345',
          pathname: '/lobster/evergreen/test/test1234'
        }}
        match={{
          isExact: true,
          path: '/lobster/evergreen/test/:id',
          params: {
            id: 'test1234'
          }
        }}
      />);
    expect(wrapper.prop('location').hash).toBe('#scroll=1234&bookmarks=1234');
    expect(wrapper.prop('location').hash).toBe('#scroll=1234&bookmarks=1234');
  });

  test('test-without-line', () => {
    const wrapper = Enzyme.shallow(
      <EvergreenLogViewer
        location={{
          pathname: '/lobster/evergreen/test/test1234'
        }}
        match={{
          isExact: true,
          path: '/lobster/evergreen/test/:id',
          params: {
            id: 'test1234'
          }
        }}
      />);
    expect(wrapper.prop('location').hash).toBe(undefined);
  });
});


['hash', 'search'].forEach((field) => {
  describe(`LogkeeperLogViewer-${field}`, () => {
    test('test-lobster', () => {
      const loc = {
        pathname: '/lobster',
        search: ''
      };
      loc[field] = field === 'search' ? '?' : '#';
      loc[field] += `server=${encodeURIComponent('localhost:9000/api/log')}&url=simple.log`;
      const wrapper = Enzyme.shallow(
        <LogkeeperLogViewer
          location={loc}
          match={{
            path: '/lobster',
            params: {}
          }}
        />);

      expect(wrapper.prop('logIdentity').type).toBe('lobster');
      expect(wrapper.prop('logIdentity').server).toBe('localhost:9000/api/log');
      expect(wrapper.prop('logIdentity').file).toBe('simple.log');
    });
  });

  test(`test-params-${field}`, () => {
    const loc = {
      pathname: '/lobster/build/build1234/all'
    };
    loc[field] = field === 'search' ? '?' : '#';
    loc[field] += 'scroll=1234';
    const wrapper = Enzyme.shallow(
      <LogkeeperLogViewer
        location={loc}
        match={{
          isExact: true,
          path: '/lobster/evergreen/build/:build/all',
          params: {
            build: 'build1234'
          }
        }}
      />);
    expect(wrapper.prop('logIdentity').type).toBe('logkeeper');
    expect(wrapper.prop('logIdentity').build).toBe('build1234');
    expect('test' in wrapper.prop('logIdentity')).toBe(false);
  });
});

describe('LogkeeperLogViewer', () => {
  test('build-test', () => {
    const loc = {
      pathname: '/lobster/build/build1234/test/test1234'
    };
    const wrapper = Enzyme.shallow(
      <LogkeeperLogViewer
        location={loc}
        match={{
          isExact: true,
          path: '/lobster/evergreen/build/:build/test/:test',
          params: {
            build: 'build1234',
            test: 'test1234'
          }
        }}
      />);
    expect(wrapper.prop('logIdentity').type).toBe('logkeeper');
    expect(wrapper.prop('logIdentity').build).toBe('build1234');
    expect(wrapper.prop('logIdentity').test).toBe('test1234');
  });

  test('test-build-notest', () => {
    const loc = {
      pathname: '/lobster/build/build1234/test/test1234'
    };
    const wrapper = Enzyme.shallow(
      <LogkeeperLogViewer
        location={loc}
        match={{
          isExact: true,
          path: '/lobster/evergreen/build/:build/all',
          params: {
            build: 'build1234'
          }
        }}
      />);
    expect(wrapper.prop('logIdentity').type).toBe('logkeeper');
    expect(wrapper.prop('logIdentity').build).toBe('build1234');
    expect('test' in wrapper.prop('logIdentity')).toBe(false);
  });
});
