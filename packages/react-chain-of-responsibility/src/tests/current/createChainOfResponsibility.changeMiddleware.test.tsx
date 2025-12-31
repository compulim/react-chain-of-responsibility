import { render } from '@testing-library/react';
import { expect } from 'expect';
import { test } from 'node:test';
import React from 'react';
import { Extract, wrapWith } from 'react-wrap-with';
import createChainOfResponsibility from '../../createChainOfResponsibility.tsx';

const { Fragment } = React;

type Props = { children?: never };

const Aloha = () => <Fragment>Aloha!</Fragment>;
const HelloWorld = () => <Fragment>Hello, World!</Fragment>;

test('when changing middleware on-the-fly should re-render and invalidate useBuildComponent', () => {
  // GIVEN: A middleware.
  const { Provider, Proxy, useBuildComponentCallback } = createChainOfResponsibility<void, Props>();

  const useBuildComponentCallbackReturnValues: ReturnType<typeof useBuildComponentCallback>[] = [];

  const Inner = () => {
    useBuildComponentCallbackReturnValues.push(useBuildComponentCallback());

    return <Proxy request={undefined} />;
  };

  const App = wrapWith(Provider, { init: Extract, middleware: Extract })(Inner);

  // WHEN: Render.
  const result = render(<App middleware={[() => next => request => next(request), () => () => () => HelloWorld]} />);

  // THEN: It should render "Hello, World!".
  expect(result.container).toHaveProperty('textContent', 'Hello, World!');

  // WHEN: Render with new middleware.
  result.rerender(<App middleware={[() => next => request => next(request), () => () => () => Aloha]} />);

  // THEN: It should render "Aloha!".
  expect(result.container).toHaveProperty('textContent', 'Aloha!');

  // THEN: It should have rendered twice.
  expect(useBuildComponentCallbackReturnValues).toHaveLength(2);

  // THEN: The first and second callback of useBuildComponentCallback() should be different.
  expect(useBuildComponentCallbackReturnValues[0]).not.toBe(useBuildComponentCallbackReturnValues[1]);
});
