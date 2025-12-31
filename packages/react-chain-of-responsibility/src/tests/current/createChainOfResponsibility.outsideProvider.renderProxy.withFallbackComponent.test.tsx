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

test('when rendering <Proxy> outside of its <Provider> with fallbackComponent should render', () => {
  // GIVEN: A <Proxy> of a newly created chain of responsibility.
  const { Proxy } = createChainOfResponsibility<void, Props>();

  const Fallback = () => <div>Hello, World!</div>;

  // WHEN: Render.
  const result = render(<Proxy fallbackComponent={Fallback} request={undefined} />);

  // THEN: It should throw an error saying <Proxy> cannot be used outside of its corresponding <Provider>.
  expect(result.container).toHaveProperty('textContent', 'Hello, World!');
});
