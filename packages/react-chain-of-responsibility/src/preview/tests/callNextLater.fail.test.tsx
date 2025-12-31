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

type MyComponentProps = Props & {
  readonly next: (request: Request) => { render: () => ReactNode } | undefined;
  readonly request: Request;
};

function MyComponent({ next, request }: MyComponentProps) {
  // Calling next() during render phase should throw.
  const result = next(request)?.render();

  return result ? <Fragment>{result}</Fragment> : null;
}

scenario(
  'call next() after the function call ended should throw',
  bdd => {
    bdd
      .given('a TestComponent using chain of responsiblity', () => {
        const { Provider, Proxy, reactComponent } = createChainOfResponsibility<Request, Props>();

        const middleware: readonly InferMiddleware<typeof Provider>[] = [
          () => next => request => reactComponent(MyComponent, { next, request })
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
        'a console.error spy',
        ({ TestComponent }) => ({ TestComponent, error: spyOn(console, 'error') }),
        ({ error }) => error.mockRestore()
      )
      .when(
        'the component is being rendered',
        ({ TestComponent }) =>
          () =>
            render(<TestComponent />)
      )
      .then('should show error message', (_, fn) =>
        expect(fn).toThrow(
          expect.objectContaining({
            message: expect.stringContaining('next() cannot be called after the function had returned synchronously')
          })
        )
      );
  },
  NodeTest
);
