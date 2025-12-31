import { render } from '@testing-library/react';
import { expect } from 'expect';
import { spyOn, type SpiedFunction } from 'jest-mock';
import { afterEach, beforeEach, test } from 'node:test';
import React, { type ComponentType } from 'react';
import { withProps, wrapWith } from 'react-wrap-with';
import createChainOfResponsibility from '../../createChainOfResponsibility.tsx';

type Props = { children?: never; className?: string };

let consoleErrorMock: SpiedFunction;

beforeEach(() => {
  // Currently, there is no way to hide the caught exception thrown by render().
  // We are mocking `console.log` to hide the exception.
  consoleErrorMock = spyOn(console, 'error');
});

afterEach(() => {
  consoleErrorMock.mockRestore();
});

test('middleware return non-component should throw on render', () => {
  // GIVEN: A middleware which return a string.
  const { Provider, Proxy } = createChainOfResponsibility<void, Props>();

  const App = wrapWith(
    withProps(Provider, { middleware: [() => () => () => 'Hello, World!' as unknown as ComponentType] })
  )(Proxy);

  // WHEN: Render.
  // THEN: It should throw an error saying middleware must return false, null, undefined, function component, or class component.
  expect(() => render(<App request={undefined} />)).toThrow(
    'middleware must return false, null, undefined, function component, or class component'
  );
});
