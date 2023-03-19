/** @jest-environment jsdom */
/// <reference types="@types/jest" />

import { render } from '@testing-library/react';
import { wrapWith } from 'react-wrap-with';
import React, { Fragment } from 'react';

import createChainOfResponsibility from './createChainOfResponsibility';

type Props = { children?: never };

const Aloha = () => <Fragment>Aloha!</Fragment>;
const HelloWorld = () => <Fragment>Hello, World!</Fragment>;

test('when changing middleware on-the-fly should re-render and invalidate useBuildComponent', () => {
  // GIVEN: A middleware.
  const { Provider, Proxy, useBuildComponent } = createChainOfResponsibility<undefined, Props>();

  const useBuildComponentReturnValues: ReturnType<typeof useBuildComponent>[] = [];

  const Inner = () => {
    useBuildComponentReturnValues.push(useBuildComponent());

    return <Proxy />;
  };

  const App = wrapWith(Provider, undefined, ['middleware'])(Inner);

  // WHEN: Render.
  const result = render(<App middleware={[() => next => request => next(request), () => () => () => HelloWorld]} />);

  // THEN: It should render "Hello, World!".
  expect(result.container).toHaveProperty('textContent', 'Hello, World!');

  // WHEN: Render with new middleware.
  result.rerender(<App middleware={[() => next => request => next(request), () => () => () => Aloha]} />);

  // THEN: It should render "Aloha!".
  expect(result.container).toHaveProperty('textContent', 'Aloha!');

  // THEN: It should have rendered twice.
  expect(useBuildComponentReturnValues).toHaveLength(2);

  // THEN: The first and second callback of useBuildComponent() should be different.
  expect(useBuildComponentReturnValues[0]).not.toBe(useBuildComponentReturnValues[1]);
});
