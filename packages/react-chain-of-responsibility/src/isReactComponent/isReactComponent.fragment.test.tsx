import { expect } from 'expect';
import { test } from 'node:test';
import React from 'react';
import isReactComponent from '../isReactComponent.ts';

const { Fragment } = React;

test('fragment should return true', () => {
  expect(isReactComponent(Fragment)).toBe(true);
});
