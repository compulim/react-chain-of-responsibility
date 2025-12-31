import { expect } from 'expect';
import { test } from 'node:test';
import React from 'react';
import isReactComponent from '../isReactComponent.ts';

const { Component } = React;

test('component class should return true', () => {
  class ComponentClass extends Component {
    override render() {
      return <div>Hello, World!</div>;
    }
  }

  expect(isReactComponent(ComponentClass)).toBe(true);
});
