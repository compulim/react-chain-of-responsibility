/** @jest-environment jsdom */

import { createComponentStrategy } from 'use-render';

test('simple scenario', () => {
  // TODO: Non-inclusive.
  expect(typeof createComponentStrategy).toBe('function');
});
