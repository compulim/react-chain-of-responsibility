import { expect } from 'expect';
import { test } from 'node:test';
import isReactComponent from '../isReactComponent.ts';

test('boolean should return false', () => {
  expect(isReactComponent(true)).toBe(false);
});
