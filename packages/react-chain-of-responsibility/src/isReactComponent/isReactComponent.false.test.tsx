import { expect } from 'expect';
import { test } from 'node:test';
import isReactComponent from '../isReactComponent.ts';

test('false should return false', () => {
  expect(isReactComponent(false)).toBe(false);
});
