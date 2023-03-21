/** @jest-environment jsdom */

import { createChainOfResponsibility, createChainOfResponsibilityForFluentUI } from 'react-chain-of-responsibility';

test('simple scenario', () => {
  // TODO: Non-inclusive.
  expect(typeof createChainOfResponsibility).toBe('function');
  expect(typeof createChainOfResponsibilityForFluentUI).toBe('function');
});
