import { expect } from 'expect';
import { test } from 'node:test';
import isReactComponent from '../isReactComponent.ts';

test('object should return false', () => {
  expect(isReactComponent({})).toBe(false);
});
