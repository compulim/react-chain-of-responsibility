import { expect } from 'expect';
import { test } from 'node:test';
import React from 'react';
import isReactComponent from '../isReactComponent.ts';

const { forwardRef } = React;

test('function component with forwardRef should return true', () => {
  const FunctionComponent = forwardRef(() => <div>Hello, World!</div>);

  expect(isReactComponent(FunctionComponent)).toBe(true);
});
