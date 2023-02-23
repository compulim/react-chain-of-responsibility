/** @jest-environment jsdom */

const { default: createComponentStrategy } = require('use-render/createComponentStrategy');

test('simple scenario', () => {
  // TODO: Non-inclusive.
  expect(typeof createComponentStrategy).toBe('function');
});
