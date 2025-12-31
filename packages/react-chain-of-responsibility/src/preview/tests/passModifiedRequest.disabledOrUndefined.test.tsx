import { scenario } from '@testduet/given-when-then';
import { render } from '@testing-library/react';
import { expect } from 'expect';
import { spyOn } from 'jest-mock';
import NodeTest from 'node:test';
import React, { type ReactNode } from 'react';
import createChainOfResponsibility, { type InferMiddleware } from '../createChainOfResponsibilityAsRenderCallback.tsx';

const { Fragment } = React;

type Props = { readonly children?: never };
type Request = string;

type DownstreamProps = Props & { readonly value: string };

function Downstream({ value }: DownstreamProps) {
  return <Fragment>({value})</Fragment>;
}

type UpstreamProps = Props & {
  readonly renderNext?: (() => ReactNode) | undefined;
};

function Upstream({ renderNext }: UpstreamProps) {
  const result = renderNext?.();

  return result ? <Fragment>{result}</Fragment> : null;
}

scenario(
  'passModifiedRequest is disabled or undefined',
  bdd => {
    bdd.given
      .oneOf([
        ['disabled', () => false],
        ['undefined', () => undefined]
      ])
      .and('a TestComponent using chain of responsiblity', passModifiedRequest => {
        const { Provider, Proxy, reactComponent } = createChainOfResponsibility<Request, Props>({
          passModifiedRequest
        });

        const middleware: readonly InferMiddleware<typeof Provider>[] = [
          () => next => request => reactComponent(Upstream, { renderNext: next(request.toUpperCase())?.render }),
          () => () => request => reactComponent(Downstream, { value: request })
        ];

        return {
          TestComponent: function TestComponent() {
            return (
              <Provider middleware={middleware}>
                <Proxy request="Hello, World!" />
              </Provider>
            );
          }
        };
      })
      .and(
        'a console.warn spy',
        ({ TestComponent }) => ({ TestComponent, warn: spyOn(console, 'warn') }),
        ({ warn }) => warn.mockRestore()
      )
      .when('the component is rendered', ({ TestComponent }) => render(<TestComponent />))
      .then('textContent should match', (_, { container }) =>
        expect(container).toHaveProperty('textContent', '(Hello, World!)')
      )
      .and('console.warn should have been called once', ({ warn }) => expect(warn).toHaveBeenCalledTimes(1))
      .and('console.warn should have been called with message', ({ warn }) =>
        expect(warn).toHaveBeenLastCalledWith(
          expect.stringContaining(
            'next() must be called with the original request, otherwise, set "options.passModifiedRequest" to true to pass a different request object downstream'
          )
        )
      );
  },
  NodeTest
);
