import { render } from '@testing-library/react';
import { expect } from 'expect';
import { mock, test } from 'node:test';
import React, { type ComponentType } from 'react';
import { withProps, wrapWith } from 'react-wrap-with';
import createChainOfResponsibility from '../../createChainOfResponsibility.tsx';

const { Fragment } = React;

type Props = { children?: never };

const HelloWorldComponent = () => <Fragment>Hello, World!</Fragment>;

test('when calling next after returned synchronously should throw', () => {
  // GIVEN: A spied middleware which returns <Fragment>Hello, World!</Fragment>.
  const { Provider, Proxy } = createChainOfResponsibility<void, Props>();
  const enhancer = mock.fn<
    (fn: (request: void) => ComponentType<Props> | false | null | undefined) => () => ComponentType<Props>
  >(() => () => HelloWorldComponent);

  const App = wrapWith(withProps(Provider, { middleware: [() => enhancer] }))(Proxy);

  // WHEN: Render.
  const result = render(<App request={undefined} />);

  // THEN: It should render "Hello, World!".
  expect(result.container).toHaveProperty('textContent', 'Hello, World!');

  // THEN: It should have called the spy middleware function once.
  expect(enhancer.mock.callCount()).toBe(1);

  // WHEN: The spied next() function is called.
  // THEN: It should throw an error saying the next() cannot be called after the function had returned synchronously.
  expect(() => enhancer.mock.calls[0]?.arguments[0](undefined)).toThrow(
    'next() cannot be called after the function had returned synchronously'
  );
});
