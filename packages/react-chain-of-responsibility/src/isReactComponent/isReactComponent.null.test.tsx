import { expect } from 'expect';
import { test } from 'node:test';
import isReactComponent from '../isReactComponent.ts';

test('null should return false', () => {
  expect(isReactComponent(null)).toBe(false);
});
