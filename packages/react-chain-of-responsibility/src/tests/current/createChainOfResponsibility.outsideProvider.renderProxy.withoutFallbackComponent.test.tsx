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

test('when rendering <Proxy> outside of its <Provider> without fallbackComponent should throw', () => {
  // GIVEN: A <Proxy> of a newly created chain of responsibility.
  const { Proxy } = createChainOfResponsibility<void, Props>();

  // WHEN: Render.
  // THEN: It should throw an error saying "This component/hook cannot be used outside of its corresponding <Provider>".
  expect(() => render(<Proxy request={undefined} />)).toThrow(
    'This component/hook cannot be used outside of its corresponding <Provider>'
  );
});
