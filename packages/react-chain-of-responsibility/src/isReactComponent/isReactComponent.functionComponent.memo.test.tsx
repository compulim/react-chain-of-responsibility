import { expect } from 'expect';
import { test } from 'node:test';
import React from 'react';
import isReactComponent from '../isReactComponent.ts';

const { memo } = React;

test('function component should return true', () => {
  const FunctionComponent = memo(() => <div>Hello, World!</div>);

  FunctionComponent.displayName = 'FunctionComponent';

  expect(isReactComponent(FunctionComponent)).toBe(true);
});
