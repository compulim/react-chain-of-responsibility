/** @jest-environment jsdom */
/// <reference types="@types/jest" />

import { render } from '@testing-library/react';
import { wrapWith } from 'react-wrap-with';
import React, { Fragment } from 'react';

import createChainOfResponsibility from './createChainOfResponsibility';

import type { ComponentType } from 'react';

type Props = { children?: never; className?: string };

let consoleErrorMock: jest.SpyInstance;

beforeEach(() => {
  // Currently, there is no way to hide the caught exception thrown by render().
  // We are mocking `console.log` to hide the exception.
  consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => jest.fn());
});

afterEach(() => {
  consoleErrorMock.mockRestore();
});

test('middleware return a React element should throw on render', () => {
  // GIVEN: A middleware which return a React element.
  const { Provider, Proxy } = createChainOfResponsibility<undefined, Props>();

  const App = wrapWith(Provider, {
    middleware: [() => () => () => (<Fragment>Hello, World!</Fragment>) as unknown as ComponentType]
  })(Proxy);

  // WHEN: Render.
  // THEN: It should throw an error saying middleware must not return React element directly.
  expect(() => render(<App />)).toThrow('middleware must not return React element directly');
});
