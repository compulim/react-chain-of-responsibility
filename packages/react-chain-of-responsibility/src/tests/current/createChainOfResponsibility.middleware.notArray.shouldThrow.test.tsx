/** @jest-environment jsdom */
/// <reference types="@types/jest" />

import { render } from '@testing-library/react';
import React from 'react';
import { Extract, wrapWith } from 'react-wrap-with';

import createChainOfResponsibility from '../../createChainOfResponsibility';

let consoleErrorMock: jest.SpyInstance;

beforeEach(() => {
  // Currently, there is no way to hide the caught exception thrown by render().
  // We are mocking `console.log` to hide the exception.
  consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => jest.fn());
});

afterEach(() => {
  consoleErrorMock.mockRestore();
});

test('initiating a provider with a non-array middleware should throw', () => {
  // GIVEN: A middleware return component with content of init object.
  const { Provider, Proxy } = createChainOfResponsibility();

  // WHEN: Render <Provider>.
  const App = wrapWith(Provider, { init: Extract, middleware: Extract })(Proxy);

  // THEN: It should not throw on empty array.
  expect(() => render(<App middleware={[]} request={undefined} />)).not.toThrow();

  // THEN: It should throw an error saying middleware prop must be an array of functions.
  expect(() => render(<App middleware={123 as unknown as []} request={undefined} />)).toThrow(
    'middleware prop must be an array of functions'
  );

  // THEN: It should throw an error saying middleware prop must be an array of functions.
  expect(() => render(<App middleware={['hello'] as unknown as []} request={undefined} />)).toThrow(
    'middleware prop must be an array of functions'
  );
});
