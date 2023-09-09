/** @jest-environment jsdom */

const {
  createChainOfResponsibility,
  createChainOfResponsibilityForFluentUI
} = require('react-chain-of-responsibility');

test('simple scenario', () => {
  // TODO: Non-inclusive.
  expect(typeof createChainOfResponsibility).toBe('function');
  expect(typeof createChainOfResponsibilityForFluentUI).toBe('function');
});
