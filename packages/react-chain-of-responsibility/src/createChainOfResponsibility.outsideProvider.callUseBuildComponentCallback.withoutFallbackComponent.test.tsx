/** @jest-environment jsdom */
/// <reference types="@types/jest" />

import { render } from '@testing-library/react';
import React from 'react';

import createChainOfResponsibility from './createChainOfResponsibility';

type Props = { children?: never };

let consoleErrorMock: jest.SpyInstance;

beforeEach(() => {
  // Currently, there is no way to hide the caught exception thrown by render().
  // We are mocking `console.log` to hide the exception.
  consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => jest.fn());
});

afterEach(() => {
  consoleErrorMock.mockRestore();
});

test('when calling useBuildComponentCallback() outside of its <Provider> should throw', () => {
  // GIVEN: useBuildComponentCallback() from a newly created chain of responsibility.
  const { useBuildComponentCallback } = createChainOfResponsibility<undefined, Props>();

  const App = () => {
    const Component = useBuildComponentCallback()(undefined);

    return Component && <Component />;
  };

  // WHEN: Render.
  // THEN: It should throw an error saying "This component/hook cannot be used outside of its corresponding <Provider>".
  expect(() => render(<App />)).toThrow('This component/hook cannot be used outside of its corresponding <Provider>');
});
