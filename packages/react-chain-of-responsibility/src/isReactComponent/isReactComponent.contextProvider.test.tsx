import { expect } from 'expect';
import { test } from 'node:test';
import React from 'react';
import isReactComponent from '../isReactComponent.ts';

const { createContext } = React;

test('context provider should return true', () => {
  const Context = createContext(undefined);

  expect(isReactComponent(Context.Consumer)).toBe(true);
  expect(isReactComponent(Context.Provider)).toBe(true);
});
