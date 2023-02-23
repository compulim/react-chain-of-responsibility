/** @jest-environment jsdom */

const { createComponentStrategy } = require('use-render');

test('simple scenario', () => {
  // TODO: Non-inclusive.
  expect(typeof createComponentStrategy).toBe('function');
});
