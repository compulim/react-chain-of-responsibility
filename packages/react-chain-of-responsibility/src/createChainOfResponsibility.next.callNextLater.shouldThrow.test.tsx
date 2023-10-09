/** @jest-environment jsdom */
/// <reference types="@types/jest" />

import { Fragment } from 'react';
import { render } from '@testing-library/react';
import { wrapWith } from 'react-wrap-with';

import createChainOfResponsibility from './createChainOfResponsibility';

import type { ComponentType } from 'react';

type Props = { children?: never };

const HelloWorldComponent = () => <Fragment>Hello, World!</Fragment>;

test('when calling next after returned synchronously should throw', () => {
  // GIVEN: A spied middleware which returns <Fragment>Hello, World!</Fragment>.
  const { Provider, Proxy } = createChainOfResponsibility<undefined, Props>();
  const enhancer = jest.fn<
    () => ComponentType<Props>,
    [(request: undefined) => ComponentType<Props> | false | null | undefined]
  >(() => () => HelloWorldComponent);

  const App = wrapWith(Provider, { middleware: [() => enhancer] })(Proxy);

  // WHEN: Render.
  const result = render(<App />);

  // THEN: It should render "Hello, World!".
  expect(result.container).toHaveProperty('textContent', 'Hello, World!');

  // THEN: It should have called the spy middleware function once.
  expect(enhancer).toBeCalledTimes(1);

  // WHEN: The spied next() function is called.
  // THEN: It should throw an error saying the next() cannot be called after the function had returned synchronously.
  expect(() => enhancer.mock.calls[0]?.[0](undefined)).toThrow(
    'next() cannot be called after the function had returned synchronously'
  );
});
