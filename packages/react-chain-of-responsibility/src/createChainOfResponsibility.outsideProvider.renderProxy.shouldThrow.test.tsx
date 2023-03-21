/** @jest-environment jsdom */
/// <reference types="@types/jest" />

import { render } from '@testing-library/react';
import React from 'react';

import createChainOfResponsibility from './createChainOfResponsibility';

type Props = { children?: never };

let consoleErrorMock: jest.SpyInstance<void, any[], any>;

beforeEach(() => {
  // Currently, there is no way to hide the caught exception thrown by render().
  // We are mocking `console.log` to hide the exception.
  consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => jest.fn());
});

afterEach(() => {
  consoleErrorMock.mockRestore();
});

test('when rendering <Proxy> outside of its <Provider> should throw', () => {
  // GIVEN: A <Proxy> of a newly created chain of responsibility.
  const { Proxy } = createChainOfResponsibility<undefined, Props>();

  // WHEN: Render.
  // THEN: It should throw an error saying <Proxy> cannot be used outside of its corresponding <Provider>.
  expect(() => render(<Proxy />)).toThrow('<Proxy> cannot be used outside of its corresponding <Provider>');
});
