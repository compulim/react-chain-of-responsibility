/** @jest-environment jsdom */
/// <reference types="@types/jest" />

import { render } from '@testing-library/react';
import { wrapWith } from 'react-wrap-with';
import React from 'react';

import createComponentChainOfResponsibility from './createComponentChainOfResponsibility';

import type { ComponentType } from 'react';

type Props = { children?: never; className?: string };

let consoleErrorMock: jest.SpyInstance<void, any[], any>;

beforeEach(() => {
  // Currently, there is no way to hide the caught exception thrown by render().
  // We are mocking `console.log` to hide the exception.
  consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => jest.fn());
});

afterEach(() => {
  consoleErrorMock.mockRestore();
});

test('middleware return non-component should throw on render', () => {
  // GIVEN: A middleware which return a string.
  const { Provider, Proxy } = createComponentChainOfResponsibility<undefined, Props>();

  const App = wrapWith(Provider, { middleware: [() => () => () => 'Hello, World!' as unknown as ComponentType] })(
    Proxy
  );

  // WHEN: Render.
  // THEN: It should throw an error saying middleware must return false, null, undefined, function component, or class component.
  expect(() => render(<App />)).toThrow(
    'middleware must return false, null, undefined, function component, or class component'
  );
});
