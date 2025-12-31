import { expect } from 'expect';
import { test } from 'node:test';
import isReactComponent from '../isReactComponent.ts';

test('array should return false', () => {
  expect(isReactComponent([])).toBe(false);
});
