import { expect } from 'expect';
import { test } from 'node:test';
import isReactComponent from '../isReactComponent.ts';

test('number should return false', () => {
  expect(isReactComponent(0)).toBe(false);
});
