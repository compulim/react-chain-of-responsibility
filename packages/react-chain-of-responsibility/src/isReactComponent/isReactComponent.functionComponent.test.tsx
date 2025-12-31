import { expect } from 'expect';
import { test } from 'node:test';
import React from 'react';
import isReactComponent from '../isReactComponent.ts';

test('function component should return true', () => {
  const FunctionComponent = () => <div>Hello, World!</div>;

  expect(isReactComponent(FunctionComponent)).toBe(true);
});
