/** @jest-environment jsdom */

import createComponentStrategy from 'use-render/createComponentStrategy';

test('simple scenario', () => {
  // TODO: Non-inclusive.
  expect(typeof createComponentStrategy).toBe('function');
});
