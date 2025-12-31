import { expect } from 'expect';
import { test } from 'node:test';
import React from 'react';
import isReactComponent from '../isReactComponent.ts';

const { PureComponent } = React;

test('component class should return true', () => {
  class ComponentClass extends PureComponent {
    override render() {
      return <div>Hello, World!</div>;
    }
  }

  expect(isReactComponent(ComponentClass)).toBe(true);
});
