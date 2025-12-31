import { expect } from 'expect';
import { test } from 'node:test';
import isReactComponent from '../isReactComponent.ts';

test('date should return false', () => {
  expect(isReactComponent(new Date())).toBe(false);
});
