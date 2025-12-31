import { expect } from 'expect';
import { test } from 'node:test';
import { createContext } from 'react';
import isReactComponent from '../isReactComponent.ts';

test('context provider should return true', () => {
  const Context = createContext(undefined);

  expect(isReactComponent(Context.Consumer)).toBe(true);
  expect(isReactComponent(Context.Provider)).toBe(true);
});
