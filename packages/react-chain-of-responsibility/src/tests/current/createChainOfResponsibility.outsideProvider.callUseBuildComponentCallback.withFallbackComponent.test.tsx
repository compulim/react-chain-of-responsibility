/** @jest-environment jsdom */
/// <reference types="@types/jest" />

import { render } from '@testing-library/react';
import React from 'react';

import createChainOfResponsibility from '../../createChainOfResponsibility';

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

test('when calling useBuildComponentCallback() outside of its <Provider> with fallbackComponent should render', () => {
  // GIVEN: useBuildComponentCallback() from a newly created chain of responsibility.
  const { useBuildComponentCallback } = createChainOfResponsibility<void, Props>();

  const Fallback = () => <div>Hello, World!</div>;

  const App = () => {
    const Component = useBuildComponentCallback()(undefined, { fallbackComponent: Fallback });

    return Component ? <Component /> : null;
  };

  // WHEN: Render.
  const result = render(<App />);

  // THEN: Should render fallbackComponent.
  expect(result.container).toHaveProperty('textContent', 'Hello, World!');
});
