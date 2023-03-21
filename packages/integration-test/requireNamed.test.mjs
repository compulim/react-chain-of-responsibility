/** @jest-environment jsdom */

const { default: createChainOfResponsibility } = require('react-chain-of-responsibility/createChainOfResponsibility');
const {
  default: createChainOfResponsibilityForFluentUI
} = require('react-chain-of-responsibility/createChainOfResponsibilityForFluentUI');

test('simple scenario', () => {
  // TODO: Non-inclusive.
  expect(typeof createChainOfResponsibility).toBe('function');
  expect(typeof createChainOfResponsibilityForFluentUI).toBe('function');
});
