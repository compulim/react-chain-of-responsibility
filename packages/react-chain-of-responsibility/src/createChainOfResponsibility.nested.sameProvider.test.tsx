/** @jest-environment jsdom */
/// <reference types="@types/jest" />

import { render } from '@testing-library/react';
import React, { Fragment } from 'react';

import createChainOfResponsibility from './createChainOfResponsibility';

type Props = { children?: never };

test('two providers of chain of responsibility nested should render', () => {
  // GIVEN: One chain of responsibility.
  const { Provider, Proxy, types } = createChainOfResponsibility<undefined, Props>();

  const middleware1: readonly (typeof types.middleware)[] = Object.freeze([
    () => next => request => {
      const Component = next(request);

      return props => <Fragment>World {Component && <Component {...props} />}</Fragment>;
    }
  ]);
  const middleware2: readonly (typeof types.middleware)[] = Object.freeze([
    () => next => request => {
      const Component = next(request);

      return props => <Fragment>Hello {Component && <Component {...props} />}</Fragment>;
    }
  ]);

  // WHEN: Render <Proxy> with same providers twice.
  const App = ({
    middleware1,
    middleware2
  }: {
    middleware1: readonly (typeof types.middleware)[];
    middleware2: readonly (typeof types.middleware)[];
  }) => (
    <Provider middleware={middleware1}>
      <Provider middleware={middleware2}>
        <Proxy />
      </Provider>
    </Provider>
  );

  const result = render(<App middleware1={middleware1} middleware2={middleware2} />);

  // THEN: It should render "Hello World ".
  expect(result.container).toHaveProperty('textContent', 'Hello World ');

  // WHEN: First middleware is updated.
  const middleware3: readonly (typeof types.middleware)[] = Object.freeze([
    () => next => request => {
      const Component = next(request);

      return props => <Fragment>Aloha {Component && <Component {...props} />}</Fragment>;
    }
  ]);

  result.rerender(<App middleware1={middleware3} middleware2={middleware2} />);

  // THEN: It should render "Hello Aloha ".
  expect(result.container).toHaveProperty('textContent', 'Hello Aloha ');
});
