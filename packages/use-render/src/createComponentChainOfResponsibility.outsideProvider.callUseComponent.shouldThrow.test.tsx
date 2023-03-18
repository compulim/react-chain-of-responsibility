/** @jest-environment jsdom */
/// <reference types="@types/jest" />

import { render } from '@testing-library/react';
import React, { Fragment } from 'react';

import createComponentChainOfResponsibility from './createComponentChainOfResponsibility';

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

test('when calling useComponent() outside of its <Provider> should throw', () => {
  // GIVEN: useComponent() from a newly created chain of responsibility.
  const { useComponent } = createComponentChainOfResponsibility<undefined, Props>();

  const App = () => {
    useComponent();

    return <Fragment />;
  };

  // WHEN: Render.
  // THEN: It should throw an error saying useComponent() hook cannot be used outside of its corresponding <Provider>.
  expect(() => render(<App />)).toThrow('useComponent() hook cannot be used outside of its corresponding <Provider>');
});
