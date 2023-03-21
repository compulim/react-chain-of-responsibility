/** @jest-environment jsdom */

import createChainOfResponsibility from 'react-chain-of-responsibility/createChainOfResponsibility';
import createChainOfResponsibilityForFluentUI from 'react-chain-of-responsibility/createChainOfResponsibilityForFluentUI';

test('simple scenario', () => {
  // TODO: Non-inclusive.
  expect(typeof createChainOfResponsibility).toBe('function');
  expect(typeof createChainOfResponsibilityForFluentUI).toBe('function');
});
