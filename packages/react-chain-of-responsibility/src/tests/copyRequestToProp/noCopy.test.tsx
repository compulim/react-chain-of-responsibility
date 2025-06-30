/** @jest-environment jsdom */
/// <reference types="@types/jest" />

import { render } from '@testing-library/react';
import React, { Fragment, memo } from 'react';

import { scenario } from '@testduet/given-when-then';
import createChainOfResponsibility from '../../createChainOfResponsibility';

type Props = {
  children?: never;
  request: string;
};

type Request = number;

let renderFn: jest.Mock;

beforeEach(() => {
  renderFn = jest.fn();
});

beforeEach(() => jest.spyOn(console, 'warn').mockImplementation(() => {}));

const OddComponent = ({ request }: { readonly request: string }) => {
  renderFn('odd');

  return <Fragment>{request.toUpperCase()}</Fragment>;
};
const EvenComponent = ({ request }: { readonly request: string }) => {
  renderFn('even');

  return <Fragment>{request.toLowerCase()}</Fragment>;
};

scenario('without copyRequestToProp, the "request" props should be left open to use', bdd => {
  bdd
    .given(`a chain without copyRequestToProp`, () =>
      createChainOfResponsibility<Request, Props>({
        copyRequestToProps: false
      })
    )
    .and('with 2 middleware handling odd/even number', chainOfResponsibility => {
      const middleware: (typeof chainOfResponsibility.types.middleware)[] = [
        () => next => request => (request % 2 === 0 ? EvenComponent : next(request)),
        () => () => () => OddComponent
      ];

      return [chainOfResponsibility, middleware] as const;
    })
    .and(
      // <Proxy> does not support reusing "request" prop.
      'render via useBuildComponentCallback()',
      ([chainOfResponsibility, middleware]) =>
        [
          chainOfResponsibility,
          middleware,
          memo<{ readonly value: Request }>(({ value }: { readonly value: Request }) => {
            const Component = chainOfResponsibility.useBuildComponentCallback()(value);

            return Component && <Component request="Hello, World!" />;
          })
        ] as const
    )
    .and('as a React component', ([{ Provider }, middleware, TestContainer]) => ({ value }: { value: Request }) => (
      <Provider middleware={middleware}>
        <TestContainer value={value} />
      </Provider>
    ))

    .when('rendering request of 1', App => render(<App value={1} />))
    .then(`should render "HELLO, WORLD!"`, (_, result) =>
      expect(result.container).toHaveProperty('textContent', 'HELLO, WORLD!')
    )
    .and('should have rendered once', () => expect(renderFn).toHaveBeenCalledTimes(1))
    .and('should have rendered for "odd"', () => expect(renderFn).toHaveBeenLastCalledWith('odd'))

    .when('re-rendering with request of 2', (App, result) => {
      result.rerender(<App value={2} />);

      return result;
    })
    .then(`should render "hello, world!"`, (_, result) =>
      expect(result.container).toHaveProperty('textContent', 'hello, world!')
    )
    .and('should have rendered twice', () => expect(renderFn).toHaveBeenCalledTimes(2))
    .and('should have rendered for "even"', () => expect(renderFn).toHaveBeenLastCalledWith('even'))

    .when('request re-rendering of "Aloha!" again', (App, result) => {
      result.rerender(<App value={2} />);

      return result;
    })
    .then(`should render "hello, world!"`, (_, result) =>
      expect(result.container).toHaveProperty('textContent', 'hello, world!')
    )
    .and('should have rendered twice only', () => expect(renderFn).toHaveBeenCalledTimes(2))
    .and('should have rendered for "even"', () => expect(renderFn).toHaveBeenLastCalledWith('even'));
});
