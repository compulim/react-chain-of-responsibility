import { render } from '@testing-library/react';
import { expect } from 'expect';
import { spyOn, type SpiedFunction } from 'jest-mock';
import { afterEach, beforeEach, test } from 'node:test';
import React from 'react';
import createChainOfResponsibility from '../../createChainOfResponsibility.tsx';

type Props = { children?: never };

let consoleErrorMock: SpiedFunction;

beforeEach(() => {
  // Currently, there is no way to hide the caught exception thrown by render().
  // We are mocking `console.log` to hide the exception.
  consoleErrorMock = spyOn(console, 'error');
});

afterEach(() => {
  consoleErrorMock.mockRestore();
});

test('when calling useBuildComponentCallback() outside of its <Provider> should throw', () => {
  // GIVEN: useBuildComponentCallback() from a newly created chain of responsibility.
  const { useBuildComponentCallback } = createChainOfResponsibility<void, Props>();

  const App = () => {
    const Component = useBuildComponentCallback()();

    return Component ? <Component /> : null;
  };

  // WHEN: Render.
  // THEN: It should throw an error saying "This component/hook cannot be used outside of its corresponding <Provider>".
  expect(() => render(<App />)).toThrow('This component/hook cannot be used outside of its corresponding <Provider>');
});
