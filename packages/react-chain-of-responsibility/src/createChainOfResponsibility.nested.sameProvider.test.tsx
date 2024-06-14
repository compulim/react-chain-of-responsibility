/** @jest-environment jsdom */
/// <reference types="@types/jest" />

import { render } from '@testing-library/react';
import React, { Fragment } from 'react';

import createChainOfResponsibility from './createChainOfResponsibility';

type Props = { children?: never };

test('two providers of chain of responsibility nested should render', () => {
  // GIVEN: One chain of responsibility.
  const { Provider, Proxy, types } = createChainOfResponsibility<undefined, Props, number>();

  const middleware1: readonly (typeof types.middleware)[] = Object.freeze([
    init => next => request => {
      const Component = next(request);

      return props => (
        <Fragment>
          Third{init} {Component && <Component {...props} />}
        </Fragment>
      );
    }
  ]);
  const middleware2: readonly (typeof types.middleware)[] = Object.freeze([
    init => next => request => {
      const Component = next(request);

      return props => (
        <Fragment>
          First{init} {Component && <Component {...props} />}
        </Fragment>
      );
    },
    init => next => request => {
      const Component = next(request);

      return props => (
        <Fragment>
          Second{init} {Component && <Component {...props} />}
        </Fragment>
      );
    }
  ]);

  // WHEN: Render <Proxy> with same providers twice.
  const App = ({
    middleware1,
    middleware2
  }: {
    middleware1: readonly (typeof types.middleware)[];
    middleware2?: readonly (typeof types.middleware)[] | undefined;
  }) => (
    <Provider init={1} middleware={middleware1}>
      {middleware2 ? (
        <Provider init={2} middleware={middleware2}>
          <Proxy />
        </Provider>
      ) : (
        <Proxy />
      )}
    </Provider>
  );

  const result = render(<App middleware1={middleware1} middleware2={middleware2} />);

  // THEN: It should render "First2 Second2 Third1 ".
  expect(result.container).toHaveProperty('textContent', 'First2 Second2 Third1 ');

  // WHEN: First middleware is updated.
  const middleware3: readonly (typeof types.middleware)[] = Object.freeze([
    init => next => request => {
      const Component = next(request);

      return props => (
        <Fragment>
          Fourth{init} {Component && <Component {...props} />}
        </Fragment>
      );
    }
  ]);

  result.rerender(<App middleware1={middleware3} middleware2={middleware2} />);

  // THEN: It should render "First2 Second2 Fourth1 ".
  expect(result.container).toHaveProperty('textContent', 'First2 Second2 Fourth1 ');

  // WHEN: Second provider is removed middleware is updated.
  result.rerender(<App middleware1={middleware3} />);

  // THEN: It should render "Fourth1 ".
  expect(result.container).toHaveProperty('textContent', 'Fourth1 ');
});
