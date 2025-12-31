import { expect } from 'expect';
import { test } from 'node:test';
import isReactComponent from '../isReactComponent.ts';

test('undefined should return false', () => {
  expect(isReactComponent(undefined)).toBe(false);
});
