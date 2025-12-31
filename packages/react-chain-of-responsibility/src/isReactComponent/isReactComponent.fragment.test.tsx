import { expect } from 'expect';
import { test } from 'node:test';
import { Fragment } from 'react';
import isReactComponent from '../isReactComponent.ts';

test('fragment should return true', () => {
  expect(isReactComponent(Fragment)).toBe(true);
});
